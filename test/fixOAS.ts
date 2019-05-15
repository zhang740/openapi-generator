import test from 'ava';
import { fixOpenAPI } from '../lib/util';

test('fix OpenAPI 3', async t => {
  const oas = require('./fixture/oas/unique.json');

  fixOpenAPI(oas);
  t.true(oas.paths['/xxx'].post.operationId === 'queryXXX_1');
});

