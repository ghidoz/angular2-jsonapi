'use strict';

module.exports = {
    entry: {
        main: './src/index.ts'
    },
    resolve: {
        extensions: [ '.ts', '.js', '.json']
    },
    output: {
        path: './dist',
        filename: '[name].bundle.js'
    },
    devtool: 'inline-source-map',
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: [/node_modules/]
            },
            {
                enforce: 'post',
                test: /\.(js|ts)$/,
                loader: 'sourcemap-istanbul-instrumenter-loader',
                exclude: [
                    /node_modules/,
                    /test/,
                    /\.(e2e|spec)\.ts$/
                ],
                query: {
                    'force-sourcemap': true
                }
            }
        ]
    },
    stats: { colors: true, reasons: true }
};