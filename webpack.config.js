var path = require('path')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var HtmlWebPackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: ['./src/app.js'],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app_bundle.js'
  },
  module: {
    loaders: [{
      loader: 'babel-loader',
      exclude: /node_modules/,
      test: /\.js$/,
      query: {
        presets: ['es2015', 'react', 'stage-0'],
      },
    }]
  },
  plugins: [
    new CopyWebpackPlugin([{
      from: './src/static/'
    }]),
    new HtmlWebPackPlugin({
      title: 'MOOCFetcher',
      template: './src/templates/index.html',
      inject: false
    })
  ]
}
