const assert = require('node:assert/strict');
const test = require('node:test');

test('src/index can be imported without starting the automation', () => {
  const index = require('../src/index');

  assert.equal(typeof index.createSession, 'function');
  assert.equal(typeof index.loadRuntimeConfig, 'function');
  assert.equal(typeof index.loadServerContext, 'function');
  assert.equal(typeof index.runActions, 'function');
});
