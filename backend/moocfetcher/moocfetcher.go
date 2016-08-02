package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"

	moocfetcher "github.com/moocfetcher/moocfetcher-appliance/backend/lib"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/urfave/cli"
)

func main() {
	app := cli.NewApp()
	app.Name = "moocfetcher"
	app.Usage = "MOOCFetcher commandline app"

	app.Commands = []cli.Command{
		{
			Name:    "update-sizes",
			Aliases: []string{"us"},
			Usage:   "Calculates and updates size (no. of bytes) of launched courses.",
			Flags: []cli.Flag{
				cli.BoolFlag{Name: "dryrun, r",
					Usage: "Don’t update remote launched.json file",
				},
			},
			Action: updateCourseSizes,
		},
	}

	app.Run(os.Args)
}

func updateCourseSizes(c *cli.Context) error {
	fmt.Println("Retrieving launched courses…")
	svc := s3.New(session.New(aws.NewConfig().WithRegion("us-east-1")))

	// Retrieve list of courses.
	resp, err := svc.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(moocfetcher.S3_BUCKET_MOOCFETCHER),
		Key:    aws.String(moocfetcher.CACHED_ONDEMAND_LAUNCHED_KEY),
	})

	if err != nil {
		return err
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		return err
	}

	var courses moocfetcher.CourseData
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
				Bucket: aws.String(moocfetcher.S3_BUCKET_MOOCFETCHER_COURSE_ARCHIVE),
				Prefix: aws.String(fmt.Sprintf(moocfetcher.COURSE_S3_FORMAT_STRING, course.Slug)),
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

	if totalSize == 0 {
		fmt.Println("Nothing to update")
		return nil
	}

	if c.Bool("dryrun") {
		fmt.Println("Dry run…not updating launched courses.")
	}

	fmt.Println("Updating launched courses")
	b, err := json.Marshal(courses)
	if err != nil {
		return err
	}

	_, err = svc.PutObject(&s3.PutObjectInput{
		Bucket: aws.String(moocfetcher.S3_BUCKET_MOOCFETCHER),
		Key:    aws.String(moocfetcher.CACHED_ONDEMAND_LAUNCHED_KEY),
		Body:   bytes.NewReader(b),
	})

	return err
}
