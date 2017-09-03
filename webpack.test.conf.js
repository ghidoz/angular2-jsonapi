'use strict';
const path = require( 'path' );
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
                test: /\.js$/,
                use: { loader: 'istanbul-instrumenter-loader' },
                include: path.resolve('src/')
              }
        ]
    },
    stats: { colors: true, reasons: true }
};