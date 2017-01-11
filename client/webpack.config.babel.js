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

import HtmlWebpackPlugin from 'html-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import path from 'path'

module.exports = {
  context: `${__dirname}/src`,
  target: 'web',
  entry: './app.js',
  output: {
    path: `${__dirname}/dist`,
    filename: 'index.js'
  },
  plugins: [
    new CopyWebpackPlugin([{from: 'static/'}]),
    new HtmlWebpackPlugin({
      template: 'templates/index.ejs',
      minify: {
        html5: true,
        removeComments: true,
        collapseWhitespace: true
      }
    })],
  module: {
    loaders: [{
      loader: 'babel-loader',
      exclude: /node_modules/,
      test: /\.js$/
    }]
  },
  externals: {jQuery: 'jQuery'},
  devServer: {
    proxy: {'/api': {target: 'http://localhost:8080'}},
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8081
  }
}
