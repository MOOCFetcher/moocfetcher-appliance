package server

import (
	"encoding/json"
	"net/http"
	"syscall"

	moocfetcher "github.com/moocfetcher/moocfetcher-appliance/backend/lib"
)

func httpJSONError(w http.ResponseWriter, error string, code int) {
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)

	resp, _ := json.Marshal(struct{ Error string }{error})
	w.Write(resp)
}

func checkFreeSpace(path string, required uint64) bool {
	var stat syscall.Statfs_t

	syscall.Statfs(path, &stat)

	// Available blocks * size per block = available space in bytes
	freespace := stat.Bavail * uint64(stat.Bsize)

	return freespace >= required

}

func calcSpaceRequired(courseData moocfetcher.CourseData) (size uint64) {
	for _, c := range courseData.Courses {
		size += c.Size
	}
	return
}
