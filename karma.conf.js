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
      require('karma-phantomjs-launcher'),
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
    browsers: ['PhantomJS'],
    singleRun: true
  };

  config.set(_config);
};