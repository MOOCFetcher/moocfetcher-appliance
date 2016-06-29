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

var path = require('path')
var webpack = require('webpack')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var HtmlWebPackPlugin = require('html-webpack-plugin')

const production = process.env.NODE_ENV === 'production'

module.exports = {
  entry: ['./src/app.js'],
  output: {
    path: path.resolve(__dirname, production ? 'dist' : 'build'),
    filename: 'app_bundle.js',
    sourceMapFilename: 'app_bundle.js.map'
  },
  module: {
    loaders: [{
      loader: 'babel-loader',
      exclude: /node_modules/,
      test: /\.js$/,
      query: {
        presets: ['es2015', 'react', 'stage-0']
      }
    }]
  },
  plugins: [
    new CopyWebpackPlugin([{
      from: './src/static/'
    }]),
    new HtmlWebPackPlugin({
      title: 'MOOCFetcher',
      template: './src/templates/index.html',
      inject: false,
      production: production
    })
  ]
}
