'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

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
    return { failedBuildsPercentage: getFailedBuildsPercentage(builds), builds: builds };
  }).then(function (_ref2) {
    var builds = _ref2.builds,
        stats = _objectWithoutProperties(_ref2, ['builds']);

    return _extends({}, stats, {
      codeDeploymentCount: getCodeDeploymentCount(builds),
      builds: builds
    });
  }).then(function (_ref3) {
    var builds = _ref3.builds,
        stats = _objectWithoutProperties(_ref3, ['builds']);

    return _extends({}, stats, {
      averageBuildTime: getAverageBuildTime(builds)
    });
  });
};