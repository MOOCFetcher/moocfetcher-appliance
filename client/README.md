MOOCFetcher appliance frontend, implemented in React.

## Setup
* Install [node] and [yarn]
* Run `yarn`

[node]: https://nodejs.org
[yarn]: https://yarnpkg.com


## Development

### Linting

```bash
yarn lint
```

This will check the source code for any syntax errors, and fix any stylistic errors if applicable.

### Development Server

```bash
yarn serve
```

This will run `webpack-dev-server` and serve the app at `localhost:8081`. In development mode, the `/api` endpoint is proxied to `localhost:8080`, where the app is expecting the API backend to be running. See the [backend] folder for details.

[backend]: https://github.com/MOOCFetcher/moocfetcher-appliance/tree/master/backend
