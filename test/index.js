const assert = require('assert');
const getStats = require('../index').getStats;

describe('getStats', () => {
  describe('whene there is no data', () => {
    it('should return 0 builds', done => {
      const builds = [];
      const fetchBatch = (offset, batchSize) => new Promise(resolve => resolve(builds))
      getStats(fetchBatch)
        .then(builds => assert.equal(builds.length, 0) )
        .then(done)
        .catch(done);
    })
  });
  describe('when the last element of the first batch is older than week ago', () => {
    it('should return two builds', done => {
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
      it('should return 5 builds', done => {
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
    describe('and there is no more data', () => {
      it('should return 3 builds', done => {
        const builds = [
          { 'start_time': '2017-03-02T10:18:33.094Z' },
          { 'start_time': '2017-03-02T10:18:33.094Z' },
          { 'start_time': '2017-03-02T10:18:33.094Z' },
        ];
        const fetchBatch = (offset, batchSize) => new Promise(resolve => resolve(builds.slice(offset, offset + batchSize)));
        getStats(fetchBatch)
          .then(builds => assert.equal(builds.length, 3) )
          .then(done)
          .catch(done);
      });
    });
  });
});
