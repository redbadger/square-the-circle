'use strict';

const request = require('request');
const moment = require('moment');

const token = process.env.CIRCLECI_TOKEN;
const endpoint = 'https://circleci.com/api/v1.1/project/github/redbadger/website-honestly';

const fetchBuilds = (offset = 0) => {
  const batchSize = 30;

  return new Promise((resolve, reject) => {
    fetchBatch(offset, batchSize, builds => {
      if(moreBuilds(builds)) {
        fetchBuilds(offset + batchSize)
          .then((previousBuilds) => {
            resolve(builds.concat(previousBuilds));
          })
      } else {
        resolve(builds);
      }
    });
  });
}

const fetchBatch = (offset, batchSize, callback) => {
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
  request(options, (err, response, builds) => {
    callback(builds);
  });
}

const moreBuilds = builds => (
  builds.filter(build => moment(build.start_time) < moment().subtract(1, 'w')).length === 0
)

fetchBuilds()
  .then(builds => {
    builds.map(build => { console.log(build.start_time) });
  });
