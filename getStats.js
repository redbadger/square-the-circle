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
        if(shouldFetchMore(builds, fromDate)) {
          fetchBuilds(nextLimit, fetchBatch, fromDate)
            .then(previousBuilds => {
              resolve(builds.concat(previousBuilds));
            })
        } else {
          resolve(builds);
        }
      });
  });
}

const shouldFetchMore = (builds, fromDate) => builds.length !==0 && recentBuilds(builds, fromDate).length === builds.length;
const recentBuilds = (builds, fromDate) => builds.filter(build => new Date(build.start_time) > fromDate);

const getFailedBuildsPercentage = builds => builds.filter(build => build.status === 'failed').length / (builds.length || 1) * 100;
const getAverageBuildTime = builds => builds.reduce((totalTime, build) => totalTime += build.build_time_millis , 0) / (builds.length || 1);
const getCodeDeploymentCount = builds => builds.filter(build => build.build_parameters && build.build_parameters.PRODUCTION && build.status !== 'failed').length;

module.exports = (fetchBatch, fromDate) => (
  fetchBuilds(0, fetchBatch, fromDate)
  .then(builds => recentBuilds(builds, fromDate))
  .then(builds => ({ failedBuildsPercentage: getFailedBuildsPercentage(builds), builds }))
  .then(({ builds, failedBuildsPercentage }) => ({ failedBuildsPercentage, codeDeploymentCount: getCodeDeploymentCount(builds), builds }))
  .then(({ builds, failedBuildsPercentage, codeDeploymentCount }) => ({ failedBuildsPercentage, codeDeploymentCount, averageBuildTime: getAverageBuildTime(builds) }))
)
