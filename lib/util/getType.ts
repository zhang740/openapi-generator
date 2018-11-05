import { SchemaObject } from 'openapi3-ts';

export function getType(schemaObject: SchemaObject): string {
  switch (schemaObject && schemaObject.type) {
    case 'number':
    case 'int':
    case 'integer':
    case 'long':
    case 'float':
    case 'double':
      return 'number';

    case 'date':
    case 'dateTime':
    case 'datetime':
      return 'Date';

    case 'string':
    case 'email':
    case 'password':
    case 'url':
    case 'byte':
    case 'binary':
      return 'string';

    case 'boolean':
      return 'boolean';

    case 'enum':
      return schemaObject.enum ? schemaObject.enum.map(v => `'${v}'`).join(' | ') : 'any';

    case 'array':
      return `${getType(schemaObject.items)}[]`;

    default:
      return 'any';
  }
}
