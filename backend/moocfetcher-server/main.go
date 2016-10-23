//go:generate esc -o static.go -prefix=../../client/dist ../../client/dist/
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"

	"github.com/NYTimes/gziphandler"
	"github.com/justinas/alice"
	"github.com/moocfetcher/moocfetcher-appliance/backend/lib/server"
	"github.com/urfave/cli"

	moocfetcher "github.com/moocfetcher/moocfetcher-appliance/backend/lib"
)

const courseMetadataFile = "/data/courses.json"

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
			Name:  "courses-dir, d",
			Usage: "Location of courses on filesystem. Load courses from `DIRECTORY`.",
		},
	}

	app.Action = func(c *cli.Context) error {
		coursesDir := c.String("courses-dir")
		port := c.Int("port")

		if coursesDir == "" {
			return errors.New("courses-directory is required")
		}

		// Parse Course Metadata
		cm := FSMustByte(false, courseMetadataFile)
		var courseMetadata moocfetcher.CourseData
		err := json.Unmarshal(cm, &courseMetadata)
		if err != nil {
			return errors.New(fmt.Sprintf("Error parsing course metadata: %s", err))
		}

		s := server.NewServer(coursesDir, courseMetadata)

		// Add handler for static content
		s.Handle("/", http.FileServer(FS(false)))

		http.ListenAndServe(fmt.Sprintf(":%d", port), alice.New(gziphandler.GzipHandler, addCorsHeaders).Then(s))
		return nil
	}

	err := app.Run(os.Args)

	if err != nil {
		fmt.Println(err)
	}
}
