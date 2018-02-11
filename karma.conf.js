"use strict";

var webpackConfig = require('./webpack.test.conf');

module.exports = function (config) {
  var _config = {
    basePath: '',
    frameworks: ['jasmine'],

    plugins: [
      require('karma-webpack'),
      require('karma-sourcemap-loader'),
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-spec-reporter'),
      require('karma-remap-istanbul'),
      require('karma-coverage')
    ],

    files: [
      {pattern: './karma-test-shim.conf.js', watched: false}
    ],

    preprocessors: {
      './karma-test-shim.conf.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    webpackServer: {
      noInfo: true
    },

    remapIstanbulReporter: {
      reports: {
        lcovonly: './coverage/lcov.info',
        html: './coverage'
      }
    },

    reporters: ['spec', 'karma-remap-istanbul'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadlessNoSandbox'],
    singleRun: true,
    customLaunchers: {
      // We can't use the sandbox in container so we disable it.
      // See https://github.com/travis-ci/travis-ci/issues/8836#issuecomment-359018652
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    }
  };

  config.set(_config);
};
