dev-server:
	webpack-dev-server --hot -d

dist:
	rm -rf dist *.tar.gz
	NODE_ENV=production webpack -p
	go build  -o dist/moocfetcher-server ../backend/moocfetcher-server/
	tar zcf moocfetcher`date +%Y-%m-%d-%k%M`.tar.gz -s /dist/moocfetcher/ dist/

.PHONY: dist dev-server
