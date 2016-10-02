module.exports = function (config) {
  var _config = {
    basePath: '',
    frameworks: ['jasmine'],

    plugins: [
      require('karma-webpack'),
      require('karma-sourcemap-loader'),
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-spec-reporter')
    ],

    files: [
      {pattern: './karma-test-shim.conf.js', watched: false}
    ],

    preprocessors: {
      './karma-test-shim.conf.js': ['webpack', 'sourcemap']
    },

    webpack: {
      resolve: {
        root: __dirname,
        extensions: ['', '.ts', '.js', '.json'],
      },
      devtool: 'inline-source-map',
      module: {
        loaders: [
          {
            test: /\.ts$/,
            loader: 'ts',
            exclude: [/node_modules/]
          }
        ]
      },
      stats: { colors: true, reasons: true },
      debug: false
    },

    webpackServer: {
      noInfo: true
    },

    reporters: ['spec'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false
  };

  config.set(_config);
};