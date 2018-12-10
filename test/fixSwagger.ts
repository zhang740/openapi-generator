import test from 'ava';
import { fixSwagger } from '../lib/util';

test('convert to OpenAPI 3', async t => {
  const swagger = require('./fixture/swagger/s_1.json');
  const fixed = require('./fixture/swagger/s_fixed.json');

  fixSwagger(swagger);
  t.deepEqual(swagger, fixed);
});

