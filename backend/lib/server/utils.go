package server

import (
	"encoding/json"
	"net/http"

	moocfetcher "github.com/moocfetcher/moocfetcher-appliance/backend/lib"
	"github.com/ricochet2200/go-disk-usage/du"
)

func httpJSONError(w http.ResponseWriter, error string, code int) {
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)

	resp, _ := json.Marshal(struct {
		Error string `json:"error,omitempty"`
	}{error})
	w.Write(resp)
}

func checkFreeSpace(path string, required uint64) bool {
	usage := du.NewDiskUsage(path)

	freespace := usage.Free()

	return freespace >= required

}

func calcSpaceRequired(courseData moocfetcher.CourseData) (size uint64) {
	for _, c := range courseData.Courses {
		size += c.Size
	}
	return
}
