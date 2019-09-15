var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './dist/index.js',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist/bundle'),
    library: 'arm-outputs',
    libraryTarget: 'umd',
    filename: 'index.js'
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: "./icon.png", to: "icon.png" },
      { from: "./task.json", to: "task.json" }
    ])
  ]
};