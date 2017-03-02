'use strict';

const request = require('request');

const circleCIFetchBatch = (offset) => {
  const token = process.env.CIRCLECI_TOKEN;
  const endpoint = 'https://circleci.com/api/v1.1/project/github/redbadger/website-honestly';
  const batchSize = 3;
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

const fetchBuilds = (offset, fetchBatch, fromDate) => {
  return new Promise((resolve, reject) => {
    fetchBatch(offset)
      .then(({ builds, nextLimit }) => {
        if(fetchMore(builds, fromDate)) {
          fetchBuilds(nextLimit, fetchBatch)
            .then(previousBuilds => {
              resolve(builds.concat(previousBuilds));
            })
        } else {
          resolve(builds);
        }
      });
  });
}

const fetchMore = (builds, fromDate) => (
  builds.length !==0 && builds.filter(build => new Date(build.start_time) < fromDate).length === 0
)

module.exports.getStats = (fetchBatch, fromDate) => (
  fetchBuilds(0, fetchBatch, fromDate)
  .then(builds => builds.filter(build => new Date(build.start_time) > fromDate))
)
