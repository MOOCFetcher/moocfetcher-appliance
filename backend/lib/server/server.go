package server

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"regexp"
	"runtime"
	"strings"
	"sync"

	usbdrivedetecter "github.com/deepakjois/gousbdrivedetector"
	moocfetcher "github.com/moocfetcher/moocfetcher-appliance/backend/lib"
)

var copyStatusPath = regexp.MustCompile("^/api/copy-status/([a-zA-Z0-9\\-]+)$")
var copyCancelPath = regexp.MustCompile("^/api/copy/([a-zA-Z0-9\\-]+)$")

// MOOCFetcherApplianceServer take request from the MOOCFetcher Appliance frontend app
// and performs copy operations, provides status updates etc.
type MOOCFetcherApplianceServer struct {
	*http.ServeMux
	courseFoldersPath string
	courseMetadata    moocfetcher.CourseData
	stats             map[string]int
	jobs              map[string]*CopyJob
	currJobId         string
	Copier            CourseCopier
	sync.Mutex
}

func NewServer(courseFoldersPath string, courseMetadata moocfetcher.CourseData) *MOOCFetcherApplianceServer {
	m := &MOOCFetcherApplianceServer{
		ServeMux:          http.NewServeMux(),
		courseFoldersPath: courseFoldersPath,
		courseMetadata:    courseMetadata,
		stats:             make(map[string]int),
		jobs:              make(map[string]*CopyJob),
	}

	m.readStats()

	m.Handle("/api/copy", http.HandlerFunc(m.copyHandler))
	m.Handle("/api/copy/", http.HandlerFunc(m.copyHandler))
	m.Handle("/api/copy-status/", http.HandlerFunc(m.progressHandler))
	m.Handle("/api/stats", http.HandlerFunc(m.statsHandler))

	return m
}

func (s *MOOCFetcherApplianceServer) copyHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		s.copyStartHandler(w, r)
		return
	case "PUT":
		s.copyCancelHandler(w, r)
		return
	default:
		http.NotFound(w, r)
		return
	}

}

func (s *MOOCFetcherApplianceServer) copyStartHandler(w http.ResponseWriter, r *http.Request) {
	s.Lock()
	defer s.Unlock()
	// Get request JSON and parse
	var courseData moocfetcher.CourseData

	defer r.Body.Close()
	err := json.NewDecoder(r.Body).Decode(&courseData)
	if err != nil {
		httpJSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	if s.currJobId != "" {
		httpJSONError(w, fmt.Sprintf("Job %s already running.", s.currJobId), http.StatusForbidden)
		return
	}

	for _, c := range courseData.Courses {
		s.stats[c.Slug]++
	}

	// Detect USB media
	drives, err := usbdrivedetecter.Detect()
	if err != nil {
		httpJSONError(w, fmt.Sprintf("Error trying to detect USB: %s", err.Error()), http.StatusInternalServerError)
		return
	}

	// Filter out drive containing courses (if required)
	for i := len(drives) - 1; i >= 0; i-- {
		drive := drives[i]
		if strings.Contains(s.courseFoldersPath, drive) {
			drives = append(drives[:i], drives[i+1:]...)
		}
	}

	// FIXME Ugly hack for Windows, hardcoded for our setup.
	// Try E:\
	if len(drives) == 0 && runtime.GOOS == "windows" {
		log.Println("Last ditch effort on Windows to detect USB Drive")
		_, err := os.Open("E:\\")
		if err == nil {
			drives = []string{"E:\\"}
		}
	}

	if len(drives) == 0 {
		httpJSONError(w, "Could not locate USB Pen Drive", http.StatusInternalServerError)
		return
	}

	// TODO write code to select most likely candidate
	drivePath := drives[len(drives)-1]

	if !checkFreeSpace(drivePath, calcSpaceRequired(courseData)) {
		httpJSONError(w, fmt.Sprintf("Not enough free space on USB media %s", drivePath), http.StatusInternalServerError)
		return
	}

	copier := s.Copier
	if copier == nil {
		copier = NewFileSystemCopier(s.courseFoldersPath, drivePath)
	}

	job := NewCopyJob(courseData, copier)
	s.currJobId = job.ID
	s.jobs[job.ID] = job

	resp := fmt.Sprintf("{ \"id\": \"%s\"}", job.ID)
	w.Write([]byte(resp))
	w.Header().Set("Content-Type", "application/json")

	// Track job
	go func() {
		done := job.Done
		go job.Run()
		<-done
		s.writeStats()
		s.Lock()
		defer s.Unlock()
		s.currJobId = ""
	}()
}

func (s *MOOCFetcherApplianceServer) copyCancelHandler(w http.ResponseWriter, r *http.Request) {
	s.Lock()
	defer s.Unlock()

	var job *CopyJob
	// Check the job ID
	if m := copyCancelPath.FindStringSubmatch(r.URL.Path); m == nil || m[1] != s.currJobId {
		http.Error(w, "404 page not found", http.StatusNotFound)
		return
	} else {
		job = s.jobs[m[1]]
	}
	if job.status == "running" {
		go job.Cancel()
	}
}

func (s *MOOCFetcherApplianceServer) progressHandler(w http.ResponseWriter, r *http.Request) {
	// Get the job ID
	m := copyStatusPath.FindStringSubmatch(r.URL.Path)
	if m == nil {
		http.Error(w, "404 page not found", http.StatusNotFound)
		return
	}

	id := m[1]
	job, ok := s.jobs[id]
	if ok {
		progress := job.Progress()
		js, err := json.Marshal(progress)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(js)
		return
	}
	http.NotFound(w, r)
}

func (s *MOOCFetcherApplianceServer) statsHandler(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "Under Construction", http.StatusNotImplemented)
}

func (s *MOOCFetcherApplianceServer) readStats() {
	file, err := ioutil.ReadFile("./stats.json")
	if err != nil {
		log.Printf("Unable to read stats file: %s\n", err)
		return
	}

	// Read stats data from file
	var stats map[string]int
	err = json.Unmarshal(file, &stats)
	if err != nil {
		log.Printf("Error reading stats file %s\n", err)
		return
	}
	s.stats = stats
}

func (s *MOOCFetcherApplianceServer) writeStats() {
	stats, err := json.Marshal(s.stats)
	if err != nil {
		log.Printf("Error writing stats file: %s\n", err)
		return
	}
	ioutil.WriteFile("./stats.json", stats, 0644)
}
