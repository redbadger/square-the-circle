'use strict';

var request = require('request');
var getStats = require('./getStats');

var circleCItoken = process.env.CIRCLECI_TOKEN;
var slackEndpoint = process.env.SLACK_ENDPOINT;

var circleCIFetchBatch = function circleCIFetchBatch(offset) {
  var endpoint = 'https://circleci.com/api/v1.1/project/github/redbadger/website-honestly';
  var batchSize = 30;
  var options = {
    method: 'GET',
    uri: endpoint,
    json: true,
    qs: {
      'circle-token': circleCItoken,
      limit: batchSize,
      offset: offset
    }
  };
  return new Promise(function (resolve) {
    request(options, function (err, response, builds) {
      resolve({ builds: builds, nextLimit: offset + batchSize });
    });
  });
};

var formatTime = function formatTime(millis) {
  var seconds = millis / 1000 % 60;
  var minutes = millis / (1000 * 60) % 60;

  return Math.floor(minutes) + ':' + Math.floor(seconds);
};

var sendToSlack = function sendToSlack(weekAgo) {
  return function (stats) {
    var report = '\n*website-honestly builds report*\n*from* _' + weekAgo.toLocaleDateString() + '_ *to* _' + new Date().toLocaleDateString() + '_\n*Failed builds*: ' + stats.failedBuildsPercentage.toFixed(2) + '%\n*Code deployments*: ' + stats.codeDeploymentCount + '\n*Average build time*: ' + formatTime(stats.averageBuildTime) + '\n';
    var options = {
      method: 'POST',
      uri: slackEndpoint,
      json: {
        'text': report
      }
    };
    request(options);
  };
};

module.exports.handler = function (event, context) {
  var weekAgo = new Date(new Date().setDate(new Date().getDate() - 7));
  getStats(circleCIFetchBatch, weekAgo).then(sendToSlack(weekAgo));
};