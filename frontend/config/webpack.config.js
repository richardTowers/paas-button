const path = require('path')

let cfg = {
  target: 'node',
  mode: 'production',
  entry: {
    main: ['./src/main.ts'],
  },
  output: {
    path: path.resolve(__dirname, '..', 'dist'),
    filename: '[name].js',
    publicPath: '/'
  },
  devtool: 'source-map',
  stats: {
    modules: false,
    warningsFilter: [
      // Express uses a dynamic require in view.js but we don't care
      /node_modules\/express\/lib\/view\.js/
    ],
  },
  optimization: {
    splitChunks: false,
    runtimeChunk: false,
  },
  performance: {
    hints: false,
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.ts/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  plugins: [],
}
module.exports = cfg
