import test from 'ava';
import { s2o } from '../lib/util';

test('convert to OpenAPI 3', async t => {
  let swagger = require('./fixture/swagger/s_1.json');
  let openAPI = require('./fixture/swagger/o_1.json');

  const data = await s2o(swagger);
  t.deepEqual(data, openAPI);
});

