import { OpenAPIObject, PathItemObject, OperationObject } from 'openapi3-ts';

export function fixOpenAPI(data: OpenAPIObject) {
  fixTag(data);
  fixOperationId(data);
}

function fixTag(data: OpenAPIObject) {
  const tags = data.tags;
  const paths = data.paths;
  Object.keys(paths).forEach(path => {
    const pathItemObject: PathItemObject = paths[path];
    Object.keys(pathItemObject).forEach(method => {
      const tagNames: string[] = pathItemObject[method].tags;
      if (!tagNames.length) {
        tagNames.push('Default');
      }
      tagNames.forEach(tagName => {
        if (!tags.find(t => t.name === tagName)) {
          tags.push({
            name: tagName,
            description: tagName,
          });
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
        operationObject.operationId = `${functionName}_${tmpFunctionRD[functionName]++}`;
      } else {
        tmpFunctionRD[functionName] = 1;
      }
    });
  });
}
