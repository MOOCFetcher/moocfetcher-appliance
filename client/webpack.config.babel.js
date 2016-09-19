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
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebPackPlugin = require('html-webpack-plugin')

const production = process.env.NODE_ENV === 'production'

let buildPath = 'build'
let nodeEnv = JSON.stringify('development')

if (production) {
  buildPath = 'dist'
  nodeEnv = JSON.stringify('production')
}

module.exports = {
  devServer: {
    quiet: false,
    stats: { colors: false },
    proxy: {
      '/api': {
        target: 'http://localhost:8080'
      }
    },
    contentBase: 'build/',
    inline: true,
    port: 8081
  },
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
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV' : nodeEnv
      }
    }),
    new CopyWebpackPlugin([{from: './src/static/'}]),
    new HtmlWebPackPlugin({
      title: 'MOOCFetcher',
      template: './src/templates/index.html',
      inject: false,
      production
    })
  ]
}
