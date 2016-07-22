MOOCFetcher appliance frontend, implemented in React.

## Setup
* Install [node]
* Run `npm install`
* Install [devd] and [modd]

[node]: https://nodejs.org
[devd]: https://github.com/cortesi/devd
[modd]: https://github.com/cortesi/modd


## Development
* Run `modd`. This will run in the background and do the following (refer to file `modd.conf` for the exact commands that are run):
  * Run Webpack in development and watch mode, which will watch for changes and bundle and copy files into `build` folder.
  * Run the `devd` daemon which serves the files from the `build` folder to access in the browser (along with LiveReload support)
  * Run `eslint` and display output every time a Javascript source file is changed
  * Invoke `jest` which will run all the tests.
* Access the app in your browser at the location specified by the output of `devd` command (usually at `localhost:8000`)

