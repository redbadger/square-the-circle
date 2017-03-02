'use strict'

const request = require('request');
const getStats = require('./getStats');

const circleCIFetchBatch = (offset) => {
  const token = process.env.CIRCLECI_TOKEN;
  const endpoint = 'https://circleci.com/api/v1.1/project/github/redbadger/website-honestly';
  const batchSize = 30;
  const options = {
    method: 'GET',
    uri: endpoint,
    json: true,
    qs: {
      'circle-token': token,
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

exports.handler = (event, context, callback) => {
  getStats(circleCIFetchBatch, new Date('2017-03-01'))
    .then(stats => { console.log(stats) });
}

getStats(circleCIFetchBatch, new Date('2017-01-01'))
  .then(stats => { console.log(stats) });
