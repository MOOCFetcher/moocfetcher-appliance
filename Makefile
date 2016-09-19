PHONY=dev-server dist

dev-server:
	webpack-dev-server --hot -d

dist:
	rm -rf dist
NODE_ENV=production webpack -p

