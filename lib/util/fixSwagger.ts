import { renameTypePrefix, testTypeNameValid } from './const';
import { CommonError } from './error';

const swaggerDefPrefix = '#/definitions/';

export function fixSwagger(data: any) {
  fixRefName(data);
  fixRequestBody(data);
}

function fixRefName(data: any) {
  const refMap: { [key: string]: any[] } = {};
  Object.keys(data.definitions || {}).forEach(key => {
    refMap[key] = [];
  });

  findRef(data).forEach(refItem => {
    const $ref: string = refItem.$ref;

    if (!$ref.startsWith(swaggerDefPrefix)) {
      throw new CommonError(`未实现解析: ${$ref}`);
    }
    const key = $ref.replace(swaggerDefPrefix, '');
    if (!refMap[key]) {
      console.warn(`未找到类型定义: ${$ref}`);
      delete refItem.$ref;
      refItem.type = 'any';
      return;
    }
    refMap[key].push(refItem);
  });

  let count = 0;
  Object.keys(refMap).forEach(key => {
    if (!testTypeNameValid(key)) {
      let newName = key.replace(/[^a-zA-Z0-9_]/g, '_');
      newName = data.definitions[newName] ? `${renameTypePrefix}${count}` : newName;

      data.definitions[newName] = data.definitions[key];
      delete data.definitions[key];

      refMap[key].forEach(refItem => {
        refItem.$ref = `${swaggerDefPrefix}${newName}`;
      });
      count++;
    }
  });
}

function fixRequestBody(data: any) {
  const paths = data.paths;
  Object.keys(paths).forEach(path => {
    const pathItemObject = paths[path];
    Object.keys(pathItemObject).forEach(method => {
      const parameters: any[] = pathItemObject[method].parameters;
      if (parameters) {
        const bodyParams = parameters.filter(p => p.in === 'body');
        switch (method.toUpperCase()) {
          case 'POST':
          case 'PUT':
            if (bodyParams.length > 1) {
              const properties: any = {};
              bodyParams.forEach(p => {
                properties[p.name] = {
                  description: p.description,
                  ...p.schema,
                };
              });

              const dtoName = 'RequestBodyDTO';
              pathItemObject[method].parameters = parameters
                .filter(p => p.in !== 'body')
                .concat({
                  in: 'body',
                  name: dtoName,
                  description: dtoName,
                  required: true,
                  schema: {
                    type: 'object',
                    required: bodyParams.filter(p => p.required).map(p => p.name),
                    properties,
                  },
                });
            }
            break;

          default:
            bodyParams.forEach(p => {
              p.in = 'query';
            });
            break;
        }
      }
    });
  });
}

function findRef(object: any) {
  // 考虑到 example
  if (!object || ({}).toString.call(object) !== '[object Object]') {
    return [];
  }

  if (object.$ref) {
    return [object];
  }
  const list: any[] = [];
  Object.keys(object).forEach(key => {
    if (typeof object === 'object') {
      list.push(...findRef(object[key]));
    }
  });
  return list;
}
