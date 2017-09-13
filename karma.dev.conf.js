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
      require('karma-coverage-istanbul-reporter'),
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

    reporters: ['spec', 'coverage-istanbul'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    // browsers: ['Chrome'],

    browsers: [
      'ChromeDebugging'
    ],
    
    customLaunchers: {
      ChromeDebugging: {
        base: 'Chrome',
        flags: [ '--remote-debugging-port=9333' ]
      }
    },
  };

  config.set(_config);
};