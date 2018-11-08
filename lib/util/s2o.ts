import * as Swagger2OAS from 'swagger2openapi';
import { OpenAPIObject } from 'openapi3-ts';

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
