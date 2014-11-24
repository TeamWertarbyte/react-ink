var Path = require('path');
var WebPack = require('webpack');

module.exports = {
  entry: './src/index.js',

  output: {
    libraryTarget: 'umd',
    path: Path.resolve(__dirname, 'dist'),
    filename: 'ink.js'
  },

  externals: {
    'react': 'react'
  },

  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
    modulesDirectories: [ 'web_modules', 'node_modules' ]
  },

  module: {
    loaders: [
      {
        test    : /\.jsx*$/,
        exclude : /node_modules/,
        loader  : 'envify-loader!jsx-loader?harmony=true'
      },
      {
        test    : /\.json$/,
        loader  : 'json-loader'
      }
    ]
  }
}