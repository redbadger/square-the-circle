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

const sendToSlack = stats => {
  const report = `
Failed builds: ${stats.failedBuildsPercentage}%
Code deployments: ${stats.codeDeploymentCount}
Average build time: ${stats.averageBuildTime}ms
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
  getStats(circleCIFetchBatch, new Date('2017-03-01'))
    .then(stats => { console.log(stats) });
}


getStats(circleCIFetchBatch, new Date('2017-02-01'))
  .then(sendToSlack);
