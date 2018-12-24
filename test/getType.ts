import test from 'ava';
import { ServiceGenerator } from '../lib/ServiceGenerator';

// tmp
const gen = new ServiceGenerator({} as any, {} as any) as any;

test('base type', t => {
  // number
  t.deepEqual(gen.getType({ type: 'number' }), 'number');
  t.deepEqual(gen.getType({ type: 'integer' }), 'number');
  t.deepEqual(gen.getType({ type: 'long' }), 'number');
  t.deepEqual(gen.getType({ type: 'float' }), 'number');
  t.deepEqual(gen.getType({ type: 'double' }), 'number');

  t.deepEqual(gen.getType({ type: 'string', format: 'int32' }), 'number');

  // string
  t.deepEqual(gen.getType({ type: 'string' }), 'string');
  t.deepEqual(gen.getType({ type: 'byte' }), 'string');
  t.deepEqual(gen.getType({ type: 'binary' }), 'string');

  // boolean
  t.deepEqual(gen.getType({ type: 'boolean' }), 'boolean');

  // date
  t.deepEqual(gen.getType({ type: 'Date' }), 'Date');
  t.deepEqual(gen.getType({ type: 'date' }), 'Date');
  t.deepEqual(gen.getType({ type: 'dateTime' }), 'Date');
});

test('enum', t => {
  t.deepEqual(gen.getType({ type: 'string', enum: ['open', 'close'] }), `"open" | "close"`);
});

test('enum, degrade', t => {
  t.deepEqual(gen.getType({ type: 'enum' }), 'string');
  t.deepEqual(gen.getType({ type: 'enum', enum: ['open', { type: 'number' }] }), '"open" | number');
});

test('array, base type', t => {
  t.deepEqual(gen.getType({ type: 'array', items: { type: 'string' } }), 'string[]');
  t.deepEqual(gen.getType({ type: 'array', items: { type: 'long' } }), 'number[]');
});

test('array, degrade', t => {
  t.deepEqual(gen.getType({ type: 'array' }), 'any[]');
});

test('oneOf', t => {
  t.deepEqual(
    gen.getType({
      type: 'object',
      oneOf: [{ type: 'string' }, { type: 'number' }],
    }),
    `string | number`
  );
});

test('properties', t => {
  t.deepEqual(
    gen.getType({
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'number' },
      },
    }),
    `{ a: string; b: number; }`
  );
});
