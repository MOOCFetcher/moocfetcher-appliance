MOOCFetcher appliance API backend, implemented in Go.

## Setup
* Install Go
* Install [esc] tool, which is used to bundle up the static assets.

[esc]: https://github.com/mjibson/esc

## Building and Running API Server

The Go application when built bundles the files for the [client] into its binary. The binary can be used as a self-contained executable suitable for serving both the client app, and the server.

[client]: https://github.com/MOOCFetcher/moocfetcher-appliance/tree/master/client

```bash
cd moocfetcher-server
go get -u
go build
./moocfetcher-server -d /Volumes/courses/
```

where `/Volumes/courses` is the location containing all the course materials. Make sure you replace it with the right location on your machine.

This will run the API server at `localhost:8080` by default. See `./moocfetcher-server -h` for details on CLI options.
