package main

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"

	moocfetcher "github.com/moocfetcher/moocfetcher-appliance/backend/lib"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/urfave/cli"
)

var svc = s3.New(session.New(aws.NewConfig().WithRegion("us-east-1")))

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
		{
			Name:    "filter-courses",
			Aliases: []string{"fc"},
			Usage:   "Filters the list of launched courses to only include courses that are present on local disk",
			Flags: []cli.Flag{
				cli.BoolFlag{Name: "dryrun, r",
					Usage: "Don’t create a filtered courses.json file",
				},
				cli.StringFlag{Name: "courses-dir, d",
					Usage: "Location of courses on filesystem. Locate courses in `DIRECTORY`.",
				},
				cli.BoolFlag{Name: "english-only, e",
					Usage: "Filter English language courses only",
				},
			},
			Action: filterCourses,
		},
	}

	app.Run(os.Args)
}

func fetchCourses() (*moocfetcher.CourseData, error) {
	fmt.Println("Retrieving launched courses…")

	// Retrieve list of courses.
	resp, err := svc.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(moocfetcher.S3BucketMOOCFetcher),
		Key:    aws.String(moocfetcher.OnDemandLaunchedCoursesKey),
	})

	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		return nil, err
	}

	var courses *moocfetcher.CourseData = &moocfetcher.CourseData{}
	err = json.Unmarshal(body, courses)
	if err != nil {
		return nil, err
	}

	return courses, nil
}

func updateCourseSizes(c *cli.Context) error {

	courses, err := fetchCourses()

	if err != nil {
		return err
	}

	var totalSize uint64
	for i, course := range courses.Courses {
		// Check if course is English
		langs := course.Languages
		var en bool
		for _, l := range langs {
			if l == "en" {
				en = true
			}
		}

		// Don’t do anything if course is not English
		if !en {
			continue
		}

		if course.Size == 0 {
			fmt.Printf("Finding size of %s…", course.Slug)

			var totalCourseSize uint64

			err := svc.ListObjectsV2Pages(&s3.ListObjectsV2Input{
				Bucket: aws.String(moocfetcher.S3BucketMOOCFetcherCourseArchive),
				Prefix: aws.String(fmt.Sprintf(moocfetcher.S3CourseURLFormatString, course.Slug)),
			}, func(page *s3.ListObjectsV2Output, lastPage bool) bool {
				for _, o := range page.Contents {
					totalCourseSize += uint64(*o.Size)
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
		return nil
	}

	fmt.Println("Updating launched courses")
	b, err := json.Marshal(courses)
	if err != nil {
		return err
	}

	_, err = svc.PutObject(&s3.PutObjectInput{
		Bucket: aws.String(moocfetcher.S3BucketMOOCFetcher),
		Key:    aws.String(moocfetcher.OnDemandLaunchedCoursesKey),
		Body:   bytes.NewReader(b),
	})

	return err
}

func filterCourses(c *cli.Context) error {
	coursesDir := c.String("courses-dir")

	if coursesDir == "" {
		return errors.New("courses-directory is required")
	}

	courses, err := fetchCourses()

	if err != nil {
		return err
	}

	var filtered moocfetcher.CourseData

	for _, course := range courses.Courses {
		path := filepath.Join(coursesDir, course.Slug)
		fmt.Printf("Checking for %s…", path)

		var found bool
		if info, err := os.Stat(path); err == nil {
			if info.Mode().IsDir() {
				found = true
				filtered.Courses = append(filtered.Courses, course)
			}
		}

		var status string
		if found {
			status = "found"
		} else {
			status = "NOT FOUND"
		}
		fmt.Printf("%s\n", status)
	}

	fmt.Printf("%d courses found\n", len(filtered.Courses))

	// Filter only English language courses, if required
	if c.Bool("english-only") {
		var english moocfetcher.CourseData
		for _, course := range filtered.Courses {
			langs := course.Languages
			var en bool
			for _, l := range langs {
				if l == "en" {
					en = true
				}
			}
			if en {
				english.Courses = append(english.Courses, course)
			}
		}
		fmt.Printf("%d English courses found\n", len(english.Courses))
		filtered = english
	}

	if c.Bool("dryrun") {
		fmt.Println("Dry run…not writing to files.")
		return nil
	}

	fmt.Println("Writing to courses.json")

	out, err := json.MarshalIndent(&filtered, "", "  ")
	if err != nil {
		return err
	}

	err = ioutil.WriteFile("courses.json", out, 0644)
	if err != nil {
		return err
	}

	fmt.Println("Writing to courses.csv")

	file, err := os.Create("courses.csv")
	if err != nil {
		return err
	}
	defer file.Close()

	writer := csv.NewWriter(file)

	writer.Write([]string{
		"Course Name",
		"Folder on Disk",
		"Course URL",
	})

	for _, course := range filtered.Courses {
		record := []string{
			course.Name,
			course.Slug,
			fmt.Sprintf("https://coursera.org/learn/%s", course.Slug),
		}

		err := writer.Write(record)
		if err != nil {
			return err
		}
	}

	defer writer.Flush()

	return nil
}
