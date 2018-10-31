import test from 'ava';
import { functionNameRD } from '../lib/util';

test('functionNameRD', t => {
  const metadata: any = {
    test: [
      { functionName: 'name' },
      { functionName: 'name' },
    ]
  };
  functionNameRD(metadata);
  t.deepEqual(metadata, {
    test: [
      { functionName: 'name' },
      { functionName: 'name_1' },
    ]
  });
});
