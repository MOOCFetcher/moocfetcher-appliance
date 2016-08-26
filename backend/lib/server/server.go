package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"sync"

	moocfetcher "github.com/moocfetcher/moocfetcher-appliance/backend/lib"
)

var copyStatusPath = regexp.MustCompile("^/api/copy-status/([a-zA-Z0-9\\-]+)$")

type jobs struct {
	list map[string]*CopyJob
}

type stats struct {
	sync.RWMutex
	courseCounts map[string]int
}

// MOOCFetcherApplianceServer take request from the MOOCFetcher Appliance frontend app
// and performs copy operations, provides status updates etc.
type MOOCFetcherApplianceServer struct {
	*http.ServeMux
	courseFoldersPath string
	courseMetadata    moocfetcher.CourseData
	stats             stats
	jobs              jobs
	currJobId         string
	sync.Mutex
}

func NewServer(courseFoldersPath string, courseMetadata moocfetcher.CourseData) *MOOCFetcherApplianceServer {
	m := &MOOCFetcherApplianceServer{
		ServeMux:          http.NewServeMux(),
		courseFoldersPath: courseFoldersPath,
		courseMetadata:    courseMetadata,
		stats:             stats{courseCounts: make(map[string]int)},
		jobs:              jobs{list: make(map[string]*CopyJob)},
	}

	// TODO Read stats data from file

	m.Handle("/api/copy", http.HandlerFunc(m.copyHandler))
	m.Handle("/api/copy-status/", http.HandlerFunc(m.progressHandler))
	m.Handle("/api/stats", http.HandlerFunc(m.statsHandler))

	return m
}

func (s *MOOCFetcherApplianceServer) copyHandler(w http.ResponseWriter, r *http.Request) {
	// Get request JSON and parse
	var courseData moocfetcher.CourseData

	defer r.Body.Close()
	err := json.NewDecoder(r.Body).Decode(&courseData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	s.Lock()

	if s.currJobId != "" {
		// FIXME Create a JSON Error Object an return it
		http.Error(w, fmt.Sprintf("Job %s already running.", s.currJobId), http.StatusForbidden)
		return
	}

	// TODO Add course data to stats

	job := NewCopyJob(courseData)
	s.currJobId = job.ID
	s.jobs.list[job.ID] = job

	s.Unlock()

	resp := fmt.Sprintf("{ \"id\": \"%s\"}", job.ID)
	w.Write([]byte(resp))
	w.Header().Set("Content-Type", "application/json")

	// Track job
	go func() {
		done := job.Done
		go job.Run()
		<-done
		s.Lock()
		defer s.Unlock()
		s.currJobId = ""
	}()
}

func (s *MOOCFetcherApplianceServer) progressHandler(w http.ResponseWriter, r *http.Request) {
	// Get the job ID
	m := copyStatusPath.FindStringSubmatch(r.URL.Path)
	if m == nil {
		http.NotFound(w, r)
		return
	}

	id := m[1]
	job, ok := s.jobs.list[id]
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
