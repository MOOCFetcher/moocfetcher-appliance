package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/urfave/cli"
)

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
type courses struct {
	Courses []struct {
		Id         string   `json:"id"`
		Name       string   `json:"name"`
		CourseType string   `json:"courseType"`
		Slug       string   `json:"slug"`
		Languages  []string `json:"primaryLanguageCodes"`
		Size       int64    `json:"size,omitempty"`
	} `json:"courses"`
}

func main() {
	app := cli.NewApp()
	app.Name = "moocfetcher"
	app.Usage = "MOOCFetcher commandline app"

	app.Commands = []cli.Command{
		{
			Name:    "update-sizes",
			Aliases: []string{"us"},
			Usage:   "Updates size (in Mb) of courses launched",
			Action:  updateCourseSizes,
		},
	}

	app.Run(os.Args)
}

func updateCourseSizes(c *cli.Context) error {
	fmt.Println("Retrieving launched courses…")
	svc := s3.New(session.New(aws.NewConfig().WithRegion("us-east-1")))

	// Retrieve list of courses.
	resp, err := svc.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(S3_BUCKET_MOOCFETCHER),
		Key:    aws.String(CACHED_ONDEMAND_LAUNCHED_KEY),
	})

	if err != nil {
		return err
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		return err
	}

	var courses courses
	err = json.Unmarshal(body, &courses)
	if err != nil {
		return err
	}

	var totalSize int64
	for i, course := range courses.Courses {
		if course.Size == 0 {
			fmt.Printf("Finding size of %s…", course.Slug)

			var totalCourseSize int64

			err := svc.ListObjectsV2Pages(&s3.ListObjectsV2Input{
				Bucket: aws.String(S3_BUCKET_MOOCFETCHER_COURSE_ARCHIVE),
				Prefix: aws.String(fmt.Sprintf(COURSE_S3_FORMAT_STRING, course.Slug)),
			}, func(page *s3.ListObjectsV2Output, lastPage bool) bool {
				for _, o := range page.Contents {
					totalCourseSize += *o.Size
				}
				return !lastPage
			})

			if err != nil {
				return err
			}
			fmt.Printf("%d MB\n", totalCourseSize/(1<<20))
			course.Size = totalCourseSize
			courses.Courses[i] = course
			totalSize += totalCourseSize
		}
	}

	fmt.Printf("\nTotal Size: %dMB\n", totalSize/(1<<20))

	fmt.Println("Updating launched courses")

	file, err := os.Create("launched.json")
	defer file.Close()
	if err != nil {
		return err
	}

	return json.NewEncoder(file).Encode(&courses)
}
