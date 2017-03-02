const moment = require('moment');
const assert = require('assert');
const getStats = require('../index').getStats;

describe('getStats', () => {
  describe('whene there is no data', () => {
    it('should return 0 builds', done => {
      const builds = [];
      const fetchBatch = (offset, batchSize) => new Promise(resolve => resolve({ builds }))
      getStats(fetchBatch, new Date('2017-03-01'))
        .then(builds => assert.equal(builds.length, 0) )
        .then(done)
        .catch(done);
    })
  });
  describe('when the last element of the first batch is older than a given date', () => {
    it('should return 2 builds', done => {
      const builds = [
        { 'start_time': '2017-03-02T10:18:33.094Z' },
        { 'start_time': '2017-03-02T10:18:33.094Z' },
        { 'start_time': '2017-02-02T10:18:33.094Z' },
      ];
      const fetchBatch = offset => new Promise(resolve => resolve({ builds }))
      getStats(fetchBatch, new Date('2017-03-01'))
        .then(builds => assert.equal(builds.length, 2) )
        .then(done)
        .catch(done);
    });
  });

  describe('when the last element of the first batch is younger than a given date', () => {
    describe('and the last element of the second batch is younger than a given date', () => {
      describe('and the last element of the third batch is older than given date', () => {
        it('should return 8 builds', done => {
          const batchSize = 3;
          const builds = [
            { 'start_time': '2017-03-02T10:18:33.094Z' },
            { 'start_time': '2017-03-02T10:18:33.094Z' },
            { 'start_time': '2017-03-02T10:18:33.094Z' },
            { 'start_time': '2017-03-02T10:18:33.094Z' },
            { 'start_time': '2017-03-02T10:18:33.094Z' },
            { 'start_time': '2017-03-02T10:18:33.094Z' },
            { 'start_time': '2017-03-02T10:18:33.094Z' },
            { 'start_time': '2017-03-02T10:18:33.094Z' },
            { 'start_time': '2017-02-02T10:18:33.094Z' },
          ];
          const fetchBatch = offset => new Promise(resolve => resolve({ builds: builds.slice(offset, offset + batchSize), nextLimit: offset + batchSize }));
          getStats(fetchBatch, new Date('2017-03-01'))
            .then(builds => assert.equal(builds.length, 8) )
            .then(done)
            .catch(done);
        });
      })
    })
    describe('and the last element of the second batch is older than given date', () => {
      it('should return 5 builds', done => {
        const batchSize = 3;
        const builds = [
          { 'start_time': '2017-03-02T10:18:33.094Z' },
          { 'start_time': '2017-03-02T10:18:33.094Z' },
          { 'start_time': '2017-03-02T10:18:33.094Z' },
          { 'start_time': '2017-03-02T10:18:33.094Z' },
          { 'start_time': '2017-03-02T10:18:33.094Z' },
          { 'start_time': '2017-02-02T10:18:33.094Z' },
        ];
        const fetchBatch = offset => new Promise(resolve => resolve({ builds: builds.slice(offset, offset + batchSize), nextLimit: offset + batchSize }));
        getStats(fetchBatch, new Date('2017-03-01'))
          .then(builds => assert.equal(builds.length, 5) )
          .then(done)
          .catch(done);
      });
    });
    describe('and there is no more data', () => {
      it('should return 3 builds', done => {
        const batchSize = 3;
        const builds = [
          { 'start_time': '2017-03-02T10:18:33.094Z' },
          { 'start_time': '2017-03-02T10:18:33.094Z' },
          { 'start_time': '2017-03-02T10:18:33.094Z' },
        ];
        const fetchBatch = offset => new Promise(resolve => resolve({ builds: builds.slice(offset, batchSize), nextLimit: batchSize }));
        getStats(fetchBatch, new Date('2017-03-01'))
          .then(builds => assert.equal(builds.length, 3) )
          .then(done)
          .catch(done);
      });
    });
  });
});
