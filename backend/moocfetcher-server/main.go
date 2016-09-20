package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/NYTimes/gziphandler"
	"github.com/justinas/alice"
	"github.com/moocfetcher/moocfetcher-appliance/backend/lib/server"
	"github.com/urfave/cli"

	moocfetcher "github.com/moocfetcher/moocfetcher-appliance/backend/lib"
)

func addCorsHeaders(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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
	})
}

func main() {
	app := cli.NewApp()
	app.Name = "moocfetcher-server"
	app.Usage = "MOOCFetcher Appliance Server"

	app.Flags = []cli.Flag{
		cli.IntFlag{
			Name:  "port, p",
			Value: 8080,
			Usage: "Run server on `PORT`",
		},
		cli.StringFlag{
			Name:  "course-metadata, m",
			Usage: "Load course metadata in JSON format from `FILE`",
		},
		cli.StringFlag{
			Name:  "courses-dir, d",
			Usage: "Location of courses on filesystem. Load courses from `DIRECTORY`.",
		},
		cli.StringFlag{
			Name:  "static-files-dir, s",
			Usage: "Load static files to be served from `DIRECTORY`",
		},
	}

	app.Action = func(c *cli.Context) error {
		courseMetadataFile := c.String("course-metadata")
		coursesDir := c.String("courses-dir")
		staticFilesDir := c.String("static-files-dir")
		port := c.Int("port")

		if courseMetadataFile == "" {
			return errors.New("course-metadata is required")
		}

		if coursesDir == "" {
			return errors.New("courses-directory is required")
		}

		if staticFilesDir == "" {
			return errors.New("static-files-dir is required")
		}

		// Parse Course Metadata
		cm, err := ioutil.ReadFile(courseMetadataFile)

		if err != nil {
			return errors.New(fmt.Sprintf("Error reading course metadata: %s", err))
		}

		var courseMetadata moocfetcher.CourseData
		err = json.Unmarshal(cm, &courseMetadata)
		if err != nil {
			return errors.New(fmt.Sprintf("Error parsing course metadata: %s", err))
		}

		s := server.NewServer(coursesDir, courseMetadata)

		// Add handler for static content
		s.Handle("/", http.FileServer(http.Dir(staticFilesDir)))

		http.ListenAndServe(fmt.Sprintf(":%d", port), alice.New(gziphandler.GzipHandler, addCorsHeaders).Then(s))
		return nil
	}

	err := app.Run(os.Args)

	if err != nil {
		fmt.Println(err)
	}
}
