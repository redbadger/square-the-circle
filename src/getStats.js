'use strict';

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

const shouldFetchMore = (builds, fromDate) => (
  builds.length !==0 && recentBuilds(builds, fromDate).length === builds.length
);

const recentBuilds = (builds, fromDate) => (
  builds.filter(build => new Date(build.start_time) > fromDate)
);

const getFailedBuildsPercentage = builds => (
  failedBuilds(builds).length / (builds.length || 1) * 100
);

const getAverageBuildTime = builds => (
  totalBuildTime(builds) / (builds.length || 1)
);

const getCodeDeploymentCount = builds => (
  builds.filter(isSuccessfulDeployment).length
);

const failedBuilds = builds => (
  builds.filter(build => build.status === 'failed')
);

const totalBuildTime = builds => (
  builds.reduce((totalTime, build) => totalTime += build.build_time_millis , 0)
);

const isSuccessfulDeployment = build => (
  build.build_parameters &&
  build.build_parameters.PRODUCTION &&
  build.status !== 'failed'
);

module.exports = (fetchBatch, fromDate) => (
  fetchBuilds(0, fetchBatch, fromDate)
  .then(builds => recentBuilds(builds, fromDate))
  .then(builds => (
    ({ failedBuildsPercentage: getFailedBuildsPercentage(builds), builds })
  ))
  .then(({ builds, ...stats }) => (
    ({
      ...stats,
      codeDeploymentCount: getCodeDeploymentCount(builds),
      builds,
    })
  ))
  .then(({ builds, ...stats }) => (
    ({
      ...stats,
      averageBuildTime: getAverageBuildTime(builds)
    })
  ))
);
