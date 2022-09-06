const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  // 開発用の設定
  mode: 'development',

  // エントリポイント
  entry: path.resolve(__dirname, 'src/index.ts'),

  // バンドル後のjsファイルの出力先
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },

  // ソースマップの出力先設定
  devtool: 'source-map',

  module: {
    rules: [
      // Typescriptファイルの処理方法
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.json'),
          },
        },
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
      },
      // WebGL
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        use: 'ts-shader-loader',
        exclude: /node_modules/,
      },
      // CSS
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      // SASS
      {
        test: /\.s[ac]ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },

  // import
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
  },

  plugins: [
    new MiniCssExtractPlugin(),
    // HTMLファイルの出力設定
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
    new HtmlWebpackPlugin({
      filename: 'scroll.html',
      template: path.resolve(__dirname, 'src/scroll/index.html'),
    }),
  ],
}
