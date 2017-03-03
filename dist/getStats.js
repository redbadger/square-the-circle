'use strict';

var fetchBuilds = function fetchBuilds(offset, fetchBatch, fromDate) {
  return new Promise(function (resolve, reject) {
    fetchBatch(offset).then(function (_ref) {
      var builds = _ref.builds,
          nextLimit = _ref.nextLimit;

      if (shouldFetchMore(builds, fromDate)) {
        fetchBuilds(nextLimit, fetchBatch, fromDate).then(function (previousBuilds) {
          resolve(builds.concat(previousBuilds));
        });
      } else {
        resolve(builds);
      }
    });
  });
};

var shouldFetchMore = function shouldFetchMore(builds, fromDate) {
  return builds.length !== 0 && recentBuilds(builds, fromDate).length === builds.length;
};

var recentBuilds = function recentBuilds(builds, fromDate) {
  return builds.filter(function (build) {
    return new Date(build.start_time) > fromDate;
  });
};

var getFailedBuildsPercentage = function getFailedBuildsPercentage(builds) {
  return failedBuilds(builds).length / (builds.length || 1) * 100;
};

var getAverageBuildTime = function getAverageBuildTime(builds) {
  return totalBuildTime(builds) / (builds.length || 1);
};

var getCodeDeploymentCount = function getCodeDeploymentCount(builds) {
  return builds.filter(isSuccessfulDeployment).length;
};

var failedBuilds = function failedBuilds(builds) {
  return builds.filter(function (build) {
    return build.status === 'failed';
  });
};

var totalBuildTime = function totalBuildTime(builds) {
  return builds.reduce(function (totalTime, build) {
    return totalTime += build.build_time_millis;
  }, 0);
};

var isSuccessfulDeployment = function isSuccessfulDeployment(build) {
  return build.build_parameters && build.build_parameters.PRODUCTION && build.status !== 'failed';
};

module.exports = function (fetchBatch, fromDate) {
  return fetchBuilds(0, fetchBatch, fromDate).then(function (builds) {
    return recentBuilds(builds, fromDate);
  }).then(function (builds) {
    return {
      failedBuildsPercentage: getFailedBuildsPercentage(builds),
      codeDeploymentCount: getCodeDeploymentCount(builds),
      averageBuildTime: getAverageBuildTime(builds)
    };
  });
};