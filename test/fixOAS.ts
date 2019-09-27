import test from 'ava';
import { fixOpenAPI } from '../lib/util';

test('fix OpenAPI 3', async t => {
  const oas = require('./fixture/oas/unique.json');

  fixOpenAPI(oas);
  t.true(oas.paths['/xxx'].post.operationId === 'queryXXX_1');
});

test('fix OpenAPI 3, twice', async t => {
  const oas = require('./fixture/oas/unique.json');

  fixOpenAPI(oas);
  const one = JSON.parse(JSON.stringify(oas));
  fixOpenAPI(oas);

  t.deepEqual(one, oas);
});
