package moocfetcher

const (
	// S3BucketMOOCFetcher is the name of the S3 Bucket where course
	// metadata is stored.
	S3BucketMOOCFetcher = "moocfetcher"

	// S3BucketMOOCFetcherCourseArchive is the name of the S3 bucket containing
	// archived courses.
	S3BucketMOOCFetcherCourseArchive = "moocfetcher-course-archive"

	// OnDemandLaunchedCoursesKey is the S3 Key for the course metadata
	// of launched courses.
	OnDemandLaunchedCoursesKey = "coursera/ondemand/launched.json"

	// S3CourseURLFormatString can be used to format course archive URLs,
	// given a slug.
	S3CourseURLFormatString = "coursera/%s"
)

// CourseData contains serialized course data
type CourseData struct {
	Courses []Course `json:"courses"`
}

// A Course contains metadata about a single course.
type Course struct {
	ID         string   `json:"id"`                   // Course ID
	Name       string   `json:"name"`                 // Course Name
	CourseType string   `json:"courseType"`           // Course Type (should be ondemand.v2)
	Slug       string   `json:"slug"`                 // Course URL slug
	Languages  []string `json:"primaryLanguageCodes"` // Array containing primary language codes
	Size       uint64   `json:"size,omitempty"`       // Size of the course in bytes
}
