// Seems to be required, because Jest is not able to automock
// modules that are specified as external dependencies in
// webpack, and are not installed inside node_modules.
module.exports = {}
