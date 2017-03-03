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

const sendToSlack = weekAgo => stats => {
  const report = `
*Report from*: _${weekAgo.toLocaleDateString()}_ to: _${new Date().toLocaleDateString()}_
*Failed builds*: ${stats.failedBuildsPercentage}%
*Code deployments*: ${stats.codeDeploymentCount}
*Average build time*: ${stats.averageBuildTime}ms
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

exports.handler = (event, context, callback) => {
  const weekAgo = new Date(new Date().setDate(new Date().getDate() - 7));
  getStats(circleCIFetchBatch, weekAgo)
    .then(sendToSlack);
}
