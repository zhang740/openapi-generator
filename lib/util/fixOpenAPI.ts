import {
  OpenAPIObject,
  PathItemObject,
  OperationObject,
  TagObject
} from 'openapi3-ts';
import { testTypeNameValid } from './const';

export function fixOpenAPI(data: OpenAPIObject) {
  fixTag(data);
  fixOperationId(data);
}

function fixTag(data: OpenAPIObject) {
  const tags = data.tags;
  const paths = data.paths;

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
            description: tagName
          };
          tags.push(tagObject);
        }
        if (!testTypeNameValid(tagObject.name)) {
          const description = tagObject.description.replace(/ /g, '');
          const newName = testTypeNameValid(description)
            ? description.replace(/ /g, '')
            : 'UNKNOWN';
          tagObject.description = tagObject.name;
          return (tagObject.name = finalNameMap[tagObject.name] = newName);
        }
      });
    });
  });
}

function fixOperationId(data: OpenAPIObject) {
  const tmpFunctionRD: { [key: string]: number } = {};
  const paths = data.paths;
  Object.keys(paths).forEach(path => {
    const pathItem: PathItemObject = paths[path];
    Object.keys(pathItem).forEach(method => {
      const operationObject: OperationObject = pathItem[method];
      const functionName = operationObject.operationId;
      if (tmpFunctionRD[functionName]) {
        operationObject.operationId = `${functionName}_${tmpFunctionRD[
          functionName
        ]++}`;
      } else {
        tmpFunctionRD[functionName] = 1;
      }
    });
  });
}
