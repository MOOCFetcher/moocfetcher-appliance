webpack-dev-server:
	webpack-dev-server --hot -d

run-moocfetcher-server:
	rm -rf build
	webpack -d
	go build -o build/moocfetcher-server ../backend/moocfetcher-server
	./build/moocfetcher-server -m build/data/courses.json -d /Users/deepak/Downloads/courses/ -s build/

dist:
	rm -rf dist *.tar.gz
	NODE_ENV=production webpack -p
	GOARM=7 GOARCH=arm GOOS=linux go build  -o dist/moocfetcher-server ../backend/moocfetcher-server/
	tar zcf moocfetcher-`date +%Y-%m-%d-%k%M`.tar.gz -s /dist/moocfetcher/ dist/

.PHONY: dist webpack-dev-server run-moocfetcher-server
