'use strict'

const request = require('request');
const getStats = require('./getStats');

const circleCItoken = process.env.CIRCLECI_TOKEN;
const slackEndpoint = process.env.SLACK_ENDPOINT;

const circleCIFetchBatch = (offset) => {
  const endpoint = 'https://circleci.com/api/v1.1/project/github/redbadger/website-honestly';
  const batchSize = 30;
  const options = {
    method: 'GET',
    uri: endpoint,
    json: true,
    qs: {
      'circle-token': circleCItoken,
      limit: batchSize,
      offset: offset,
    }
  }
  return new Promise(resolve => {
    request(options, (err, response, builds) => {
      resolve({ builds, nextLimit: offset + batchSize });
    });
  })
}

const formatTime = millis => {
  const seconds = (millis / 1000) % 60;
  const minutes = (millis / (1000 * 60)) % 60;

  return `${Math.floor(minutes)}:${Math.floor(seconds)}`
}

const sendToSlack = weekAgo => stats => {
  const report = `
*website-honestly builds report*
*from* _${weekAgo.toLocaleDateString()}_ *to* _${new Date().toLocaleDateString()}_
*Failed builds*: ${stats.failedBuildsPercentage.toFixed(2)}%
*Code deployments*: ${stats.codeDeploymentCount}
*Average build time*: ${formatTime(stats.averageBuildTime)}
`
  const options = {
    method: 'POST',
    uri: slackEndpoint,
    json: {
      'text': report
    }
  }
  request(options);
}

module.exports.handler = (event, context) => {
  const weekAgo = new Date(new Date().setDate(new Date().getDate() - 7));
  getStats(circleCIFetchBatch, weekAgo)
    .then(sendToSlack(weekAgo));
}
