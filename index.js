'use strict';

const request = require('request');
const moment = require('moment');

const circleCIFetchBatch = (offset, batchSize) => {
  const token = process.env.CIRCLECI_TOKEN;
  const endpoint = 'https://circleci.com/api/v1.1/project/github/redbadger/website-honestly';
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
      resolve(builds);
    });
  })
}

const fetchBuilds = (offset, fetchBatch) => {
  const batchSize = 3;

  return new Promise((resolve, reject) => {
    fetchBatch(offset, batchSize)
      .then(builds => {
        if(moreBuilds(builds)) {
          fetchBuilds(offset + batchSize, fetchBatch)
            .then((previousBuilds) => {
              resolve(builds.concat(previousBuilds));
            })
        } else {
          resolve(builds);
        }
      });
  });
}

const moreBuilds = builds => (
  builds.filter(build => moment(build.start_time) < moment().subtract(1, 'w')).length === 0
)

module.exports.getStats = (fetchBatch) => (
  fetchBuilds(0, fetchBatch)
  .then(builds => builds.filter(build => moment(build.start_time) > moment().subtract(1, 'w')))
)
