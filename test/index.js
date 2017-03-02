const assert = require('assert');
const getStats = require('../index').getStats;

describe('getStats', () => {
  it('should return a collection of builds', (done) => {
    const builds = [
      {
        'start_time': '2017-03-02T10:18:33.094Z',
      },
      {
        'start_time': '2017-03-02T10:18:33.094Z',
      },
      {
        'start_time': '2017-02-02T10:18:33.094Z',
      },
    ];
    const fetchBatch = (offset, batchSize) => new Promise(resolve => resolve(builds))
    getStats(fetchBatch)
      .then(builds => assert.equal(builds.length, 2) )
      .then(done)
      .catch(done);
  });
});
