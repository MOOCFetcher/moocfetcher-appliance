/*
 * USAGE:
 *
 * Make sure you use the right way to invoke webpack, because the config
 * file relies on it to determine if development or production settings
 * must be used.
 *
 * Development: webpack -d
 *
 * Production: NODE_ENV=production webpack -p
 *
 */

const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebPackPlugin = require('html-webpack-plugin')

const production = process.env.NODE_ENV === 'production'

let buildPath = 'build'

if (production) {
  buildPath = 'dist'
}

module.exports = {
  entry: ['./src/app.js'],
  output: {
    path: path.resolve(__dirname, buildPath),
    filename: 'app_bundle.js',
    sourceMapFilename: 'app_bundle.js.map'
  },
  externals: {jQuery: 'jQuery'},
  module: {
    loaders: [{
      loader: 'babel-loader',
      exclude: /node_modules/,
      test: /\.js$/
    }]
  },
  plugins: [
    new CopyWebpackPlugin([{from: './src/static/'}]),
    new HtmlWebPackPlugin({
      title: 'MOOCFetcher',
      template: './src/templates/index.html',
      inject: false,
      production
    })
  ]
}
