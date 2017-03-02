const assert = require('assert');
const getStats = require('../index').getStats;

describe('getStats', () => {
  describe('when the last element of the first batch is older than week ago', () => {
    it('should return only one batch of data', done => {
      const builds = [
        { 'start_time': '2017-03-02T10:18:33.094Z' },
        { 'start_time': '2017-03-02T10:18:33.094Z' },
        { 'start_time': '2017-02-02T10:18:33.094Z' },
      ];
      const fetchBatch = (offset, batchSize) => new Promise(resolve => resolve(builds))
      getStats(fetchBatch)
        .then(builds => assert.equal(builds.length, 2) )
        .then(done)
        .catch(done);
    });
  });

  describe('when the last element of the first batch is younger than week ago', () => {
    describe('and the last element of the second batch is older than week ago', () => {
      it('should request two batches of data', done => {
        const builds = [
          { 'start_time': '2017-03-02T10:18:33.094Z' },
          { 'start_time': '2017-03-02T10:18:33.094Z' },
          { 'start_time': '2017-03-02T10:18:33.094Z' },
          { 'start_time': '2017-03-02T10:18:33.094Z' },
          { 'start_time': '2017-03-02T10:18:33.094Z' },
          { 'start_time': '2017-02-02T10:18:33.094Z' },
        ];
        const fetchBatch = (offset, batchSize) => new Promise(resolve => resolve(builds.slice(offset, offset + batchSize)));
        getStats(fetchBatch)
          .then(builds => assert.equal(builds.length, 5) )
          .then(done)
          .catch(done);
      });
    });
  });
});
