import { OpenAPIObject, PathItemObject, OperationObject, TagObject } from 'openapi3-ts';
import { testTypeNameValid } from './const';

export function fixOpenAPI(data: OpenAPIObject) {
  fixTag(data);
  fixUniqueTagOperation(data);
}

function fixTag(data: OpenAPIObject) {
  const { tags, paths } = data;
  const finalNameMap: { [name: string]: string } = {};

  Object.keys(paths).forEach(path => {
    const pathItemObject: PathItemObject = paths[path];
    Object.keys(pathItemObject).forEach(method => {
      const operation: OperationObject = pathItemObject[method];
      if (!Array.isArray(operation.tags) || !operation.tags.length) {
        operation.tags = ['Default'];
      }
      operation.tags = operation.tags.map(tagName => {
        if (finalNameMap[tagName]) {
          return finalNameMap[tagName];
        }
        let tagObject: TagObject = tags.find(t => t.name === tagName);
        if (!tagObject) {
          tagObject = {
            name: tagName,
            description: tagName,
          };
          tags.push(tagObject);
        }
        if (!testTypeNameValid(tagObject.name)) {
          const description = (tagObject.description || tagObject.name).replace(/ /g, '');
          const newName = testTypeNameValid(description) ? description : 'UNKNOWN';
          tagObject.description = tagObject.name;
          return (tagObject.name = finalNameMap[tagObject.name] = newName);
        } else {
          return (finalNameMap[tagObject.name] = tagObject.name);
        }
      });
    });
  });
}

function fixUniqueTagOperation(data: OpenAPIObject) {
  const { paths } = data;
  const tagOpNameCounter: { [key: string]: number } = {};

  Object.keys(paths).forEach(path => {
    const pathItemObject: PathItemObject = paths[path];
    [
      pathItemObject.get,
      pathItemObject.put,
      pathItemObject.post,
      pathItemObject.delete,
      pathItemObject.options,
      pathItemObject.head,
      pathItemObject.patch,
      pathItemObject.trace,
    ].filter(o => o).forEach(operation => {
      operation.tags.forEach(tag => {
        const key = `${tag}.${operation.operationId}`;
        if (tagOpNameCounter[key]) {
          operation.operationId += `_${tagOpNameCounter[key]++}`;
        } else {
          tagOpNameCounter[key] = 1;
        }
      });
    });
  });
}
