//go:generate esc -o static.go -modtime=1483228800 -ignore=moocfetcher-server  -prefix=../../client/dist ../../client/dist/
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"

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
		cli.StringFlag{
			Name:  "log-file, l",
			Usage: "If set, log all output to `FILE`",
		},
		cli.StringFlag{
			Name:  "usb-drive, u",
			Usage: "If set, use the value as location of USB pen drive on Windows",
		},
	}

	app.Action = func(c *cli.Context) error {
		logFile := c.String("log-file")
		if logFile != "" {
			f, err := os.OpenFile(logFile, os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
			if err != nil {
				log.Fatalf("error opening log file: %v", err)
			}
			defer f.Close()

			log.SetOutput(f)
		}

		coursesDir := c.String("courses-dir")
		port := c.Int("port")
		usbDrive := c.String("usb-drive")

		if coursesDir == "" {
			return errors.New("courses-directory is required")
		}

		// Parse Course Metadata
		var cm []byte
		onDiskCourseMetadata := filepath.Join(coursesDir, "courses.json")
		if _, err := os.Stat(onDiskCourseMetadata); err == nil {
			log.Println("Found metadata in courses directory. Reading…")
			cm, err = ioutil.ReadFile(onDiskCourseMetadata)
			if err != nil {
				log.Fatalf("Could not read file %s:\n", onDiskCourseMetadata)
			}
		} else {
			// Load from bundled assets
			cm = FSMustByte(false, courseMetadataFile)
		}
		var courseMetadata moocfetcher.CourseData
		err := json.Unmarshal(cm, &courseMetadata)
		if err != nil {
			return errors.New(fmt.Sprintf("Error parsing course metadata: %s", err))
		}

		s := server.NewServer(coursesDir, courseMetadata)
		s.USBDriveOverride = usbDrive // FIXME Ugly hack for Windows

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
