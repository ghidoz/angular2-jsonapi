'use strict';

module.exports = {
    resolve: {
        root: __dirname,
        extensions: ['', '.ts', '.js', '.json']
    },
    devtool: 'inline-source-map',
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts',
                exclude: [/node_modules/]
            }
        ],
        postLoaders: [
            {
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
    stats: { colors: true, reasons: true },
    debug: false
};