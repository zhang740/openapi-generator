import * as Swagger2OAS from 'swagger2openapi';
import { OpenAPIObject, ReferenceObject } from 'openapi3-ts';

export function s2o(data: any) {
  return new Promise<OpenAPIObject>((resolve, reject) => {
    data = Swagger2OAS.convertObj(data, {
      warnOnly: true,
      patch: true,
      resolve: true,
    }, (err: any, result: any) => {
      if (err) {
        return reject(err);
      }
      return resolve(result.openapi);
    }) || {};
  });
}

export function getValue<T = any>(func: () => T, defaultValue?: T) {
  try {
    return func();
  } catch (error) {
    return defaultValue;
  }
}

/** 解析绝对路径$ref */
export function resolveRef(rootData: OpenAPIObject, refObject: ReferenceObject | any) {
  return getValue(() => {
    let result: any = refObject;
    if (refObject.$ref) {
      const refPaths = refObject.$ref.split('/');
      if (refPaths[0] === '#') {

        refPaths.shift();
        let obj: any = rootData;
        refPaths.forEach((node: any) => {
          obj = obj[node];
        });

        result = { ...obj };
        // FIXME 防止循环引用
        return result;
      }
    }

    Object.keys(result).forEach((key) => {
      if (typeof result[key] === 'object') {
        result[key] = resolveRef(rootData, result[key] as ReferenceObject);
      }
    });

    return result;
  }, refObject);
}
