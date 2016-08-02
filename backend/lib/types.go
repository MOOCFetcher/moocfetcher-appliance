package moocfetcher

const (
	// S3 Bucket containing course metadata.
	S3_BUCKET_MOOCFETCHER = "moocfetcher"

	// S3 Bucket containing archived courses.
	S3_BUCKET_MOOCFETCHER_COURSE_ARCHIVE = "moocfetcher-course-archive"

	// S3 Key for file containing metadata for launched on-demand courses.
	CACHED_ONDEMAND_LAUNCHED_KEY = "coursera/ondemand/launched.json"

	// Prefix for a course directory in S3 Bucket
	COURSE_S3_FORMAT_STRING = "coursera/%s"
)

// Course data
type CourseData struct {
	Courses []struct {
		Id         string   `json:"id"`
		Name       string   `json:"name"`
		CourseType string   `json:"courseType"`
		Slug       string   `json:"slug"`
		Languages  []string `json:"primaryLanguageCodes"`
		Size       int64    `json:"size,omitempty"`
	} `json:"courses"`
}
