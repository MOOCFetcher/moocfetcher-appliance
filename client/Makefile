package: build-client build-server

build-client:
	webpack -p

build-server:
	go generate ../backend/moocfetcher-server/
	go build -o dist/moocfetcher-server ../backend/moocfetcher-server

package-win:
	rm -rf dist
	NODE_ENV=production webpack -p
	go generate ../backend/moocfetcher-server/
	GOOS=windows GOARCH=amd64 go build -o dist/moocfetcher-server.exe ../backend/moocfetcher-server/

.PHONY: package package-win build-server build-client
