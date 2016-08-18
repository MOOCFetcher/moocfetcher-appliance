package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"time"

	moocfetcher "github.com/moocfetcher/moocfetcher-appliance/backend/lib"
	"github.com/satori/go.uuid"
)

var copyStatusPath = regexp.MustCompile("^/api/copy-status/([a-zA-Z0-9\\-]+)$")

type CopyHandler struct {
	Jobs map[string]*CopyJob
}

type CopyJob struct {
	ID         string
	courseData moocfetcher.CourseData
	finished   []string
	current    string
}

type CopyJobProgress struct {
	Current string `json:"current,omitempty"`
	Done    int    `json:"done"`
	Total   int    `json:"total"`
}

func (c *CopyJob) Run() {
	// FIXME totally stubbed out implementation
	for len(c.finished) < len(c.courseData.Courses) {
		c.finished = append(c.finished, c.courseData.Courses[len(c.finished)].Slug)
		c.current = c.finished[len(c.finished)-1]

		time.Sleep(5 * time.Second)
	}
}

func (c *CopyJob) Progress() CopyJobProgress {
	return CopyJobProgress{
		Current: c.current,
		Done:    len(c.finished),
		Total:   len(c.courseData.Courses),
	}
}

func NewCopyHandler() *CopyHandler {
	return &CopyHandler{
		Jobs: map[string]*CopyJob{},
	}
}

func (ch *CopyHandler) NewCopyJob(cd moocfetcher.CourseData) *CopyJob {
	id := uuid.NewV4().String()
	job := &CopyJob{
		ID:         id,
		courseData: cd,
	}

	ch.Jobs[id] = job

	return job
}

func (ch *CopyHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Get request JSON and parse
	var courseData moocfetcher.CourseData

	defer r.Body.Close()
	err := json.NewDecoder(r.Body).Decode(&courseData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	job := ch.NewCopyJob(courseData)
	resp := fmt.Sprintf("{ \"id\": \"%s\"}", job.ID)
	w.Write([]byte(resp))
	w.Header().Set("Content-Type", "application/json")
	go job.Run()
}

type CopyStatusHandler struct {
	Jobs map[string]*CopyJob
}

func NewCopyStatusHandler(jobs map[string]*CopyJob) *CopyStatusHandler {
	return &CopyStatusHandler{
		Jobs: jobs,
	}
}

func (csh *CopyStatusHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Get the job ID
	m := copyStatusPath.FindStringSubmatch(r.URL.Path)
	if m == nil {
		fmt.Println("Match not found")
		http.NotFound(w, r)
		return
	}

	id := m[1]
	if job, ok := csh.Jobs[id]; ok {
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
	fmt.Printf("Job not found: %s\n", id)
	http.NotFound(w, r)
}

func statsHandler(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "Under Construction", http.StatusNotImplemented)
}

func addCorsHeaders(h http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if origin := r.Header.Get("Origin"); origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		if r.Method == "OPTIONS" {
			return
		}
		h.ServeHTTP(w, r)
	}
}

func main() {
	// TODO Init application
	ch := NewCopyHandler()
	http.Handle("/api/copy", ch)
	http.Handle("/api/copy-status/", NewCopyStatusHandler(ch.Jobs))
	http.Handle("/api/stats", http.HandlerFunc(statsHandler))

	http.ListenAndServe(":8080", addCorsHeaders(http.DefaultServeMux))
}
