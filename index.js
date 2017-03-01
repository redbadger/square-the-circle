'use strict';

const request = require('request');
const moment = require('moment');

const token = process.env.CIRCLECI_TOKEN;
const endpoint = 'https://circleci.com/api/v1.1/project/github/redbadger/website-honestly';

function fetchBatch(offset, builds) {
  const limit = 3;
  const options = {
    method: 'GET',
    uri: endpoint,
    json: true,
    qs: {
      'circle-token': token,
      limit: limit,
      offset: offset,
    }
  }
  return new Promise((resolve, reject) => {
    request(options, (err, response, body) => {
      builds.push(...body);
      if(startedWeekAgo(body)) {
        fetchBatch(offset + limit, builds)
          .then(() => {
            resolve();
          })
      } else {
        resolve();
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

const builds = [];
fetchBatch(0, builds) //TODO: refactor offset starting value
  .then(() => {
    builds.map(build => { console.log(build.start_time) });
  });
