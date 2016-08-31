package server

import (
	"log"

	moocfetcher "github.com/moocfetcher/moocfetcher-appliance/backend/lib"

	uuid "github.com/satori/go.uuid"
)

type CopyJob struct {
	ID         string
	courseData moocfetcher.CourseData
	finished   []string
	current    string
	status     string
	err        error
	Done       chan bool
	copier     CourseCopier
}

type CopyJobProgress struct {
	Current string `json:"current,omitempty"`
	Done    int    `json:"done"`
	Total   int    `json:"total"`
	Status  string `json:"status"`
}

func NewCopyJob(cd moocfetcher.CourseData, copier CourseCopier) *CopyJob {
	id := uuid.NewV4().String()

	job := &CopyJob{
		ID:         id,
		courseData: cd,
		status:     "init",
		Done:       make(chan bool),
		copier:     copier,
	}
	return job

}

func (c *CopyJob) Run() {
	c.status = "running"
	log.Printf("Copying %d courses\n", len(c.courseData.Courses))
	for len(c.finished) < len(c.courseData.Courses) {
		current := c.courseData.Courses[len(c.finished)]
		c.current = c.courseData.Courses[len(c.finished)].Name
		err := c.copier.Copy(current.Slug)
		if err != nil {
			if err == CopyCancelled {
				c.status = "cancelled"
				break
			}
			c.status = "error"
			log.Printf("Error while copying: %s\n", err)
			c.err = err
			break
		}
		c.finished = append(c.finished, current.Slug)
	}
	c.current = ""
	if len(c.finished) == len(c.courseData.Courses) {
		c.status = "finished"
	}
	c.Done <- true
}

func (c *CopyJob) Cancel() {
	c.status = "cancel_requested"
	c.copier.Cancel()
}

func (c *CopyJob) Progress() CopyJobProgress {
	return CopyJobProgress{
		Current: c.current,
		Done:    len(c.finished),
		Total:   len(c.courseData.Courses),
		Status:  c.status,
	}
}
