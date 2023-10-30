const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    // モード値を production に設定すると最適化された状態で、
    // development に設定するとソースマップ有効でJSファイルが出力される
    // mode: 'development', // "production" | "development" | "none"
    mode: 'production', // "production" | "development" | "none"

    // メインとなるJavaScriptファイル（エントリーポイント）
    entry: './ts/index.ts',

    output: {
        path: path.join(__dirname, "docs"),
        filename: "index.js"
    },

    module: {
        rules: [{
            // 拡張子 .ts の場合
            test: /\.ts$/,
            // TypeScript をコンパイルする
            use: 'ts-loader'
        },
        {
            test: /\.glsl$/,
            use: ['raw-loader',
                'glslify-loader'
            ]
        },
        {
            test: /\.css$/, // .css拡張子を持つファイルを対象にする
            use: ['style-loader', 'css-loader'], // style-loaderとcss-loaderを使用
        }
        ]
    },
    // import 文で .ts ファイルを解決するため
    resolve: {
        modules: [
            "node_modules", // node_modules 内も対象とする
        ],
        extensions: [
            '.ts',
            '.js' // node_modulesのライブラリ読み込みに必要
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            favicon: './favicon.ico',
        })
    ],
};
