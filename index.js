'use strict';

const request = require('request');
const moment = require('moment');

const token = process.env.CIRCLECI_TOKEN;
const endpoint = 'https://circleci.com/api/v1.1/project/github/redbadger/website-honestly';

function fetchBuilds(offset = 0) {
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
  return new Promise((resolve, reject) => {
    request(options, (err, response, body) => {
      if(startedWeekAgo(body)) {
        fetchBuilds(offset + batchSize)
          .then((previousBody) => {
            resolve(body.concat(previousBody));
          })
      } else {
        resolve(body);
      }
    });
  });
}

function startedWeekAgo(builds) {
  if (builds && builds.length !== 0) {
    const startTime = moment(builds[builds.length - 1]['start_time']);
    const weekAgo = moment().subtract(1, 'w');
    return startTime > weekAgo;
  }
  return false;
}

fetchBatch()
  .then((builds) => {
    builds.map(build => { console.log(build.start_time) });
  });
