'use strict';

const request = require('request');

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

const fetchBuilds = (offset, fetchBatch, fromDate) => {
  const batchSize = 3;

  return new Promise((resolve, reject) => {
    fetchBatch(offset, batchSize)
      .then(builds => {
        if(moreBuilds(builds, batchSize, fromDate)) {
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

const moreBuilds = (builds, batchSize, fromDate) => (
  builds.filter(build => new Date(build.start_time) > fromDate).length === batchSize
)

module.exports.getStats = (fetchBatch, fromDate) => (
  fetchBuilds(0, fetchBatch, fromDate)
  .then(builds => builds.filter(build => new Date(build.start_time) > fromDate))
)
