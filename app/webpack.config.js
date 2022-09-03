const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  // 開発用の設定
  mode: "development",

  // エントリポイント
  entry: path.resolve(__dirname, "src/index.ts"),

  // バンドル後のjsファイルの出力先
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },

  // ソースマップの出力先設定
  devtool: "source-map",

  module: {
    rules: [
      // Typescriptファイルの処理方法
      {
        test: /\.ts$/,
        use: "ts-loader",
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
      },
      // WebGL
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        use: "ts-shader-loader",
        exclude: /node_modules/,
      },
    ],
  },

  // import
  resolve: {
    extensions: [".ts"],
    modules: [path.resolve(__dirname, "src"), "node_modules"],
  },

  plugins: [
    // HTMLファイルの出力設定
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src/index.html"),
    }),
  ],
};
