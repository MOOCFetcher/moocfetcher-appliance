webpack-dev-server:
	go build -o build/moocfetcher-server ../backend/moocfetcher-server
	webpack-dev-server --hot -d

dist:
	rm -rf dist
	NODE_ENV=production webpack -p
	go generate ../backend/moocfetcher-server/
	GOOS=windows GOARCH=amd64 go build -o dist/moocfetcher-server.exe ../backend/moocfetcher-server/

.PHONY: dist run-moocfetcher-server
