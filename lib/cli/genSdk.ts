import { genAPISDK, GenConfig, RouteMetadataType } from '..';
import * as request from 'request';
import {
  OpenAPIObject, PathItemObject, OperationObject, ParameterObject, RequestBodyObject, ReferenceObject, ResponsesObject, SchemaObject
} from 'openapi3-ts';
import { resolveRef, s2o } from '../util/parse';
import { getType } from '../util/getType';
import { ParamType } from '../type';

async function getJSONObjectFromUrl(url: string) {
  return new Promise<string>((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) {
        console.warn('[Api-GenSDK] err', error);
        reject(error);
      }
      if (response.statusCode !== 200) {
        console.warn('[Api-GenSDK] err', error);
        reject(new Error(response.statusMessage));
      }
      resolve(body);
    });
  });
}

export async function genAPISDKFromUrl(url: string, config: GenConfig) {
  let data: OpenAPIObject = JSON.parse(await getJSONObjectFromUrl(url));

  if (!data || !data.paths || !data.info) {
    throw new Error('数据格式不正确');
  }

  if (data.swagger === '2.0') {
    resolveRef(data, data.paths);
    data = await s2o(data);
    resolveRef(data, data.paths);

    Object.keys(data.paths).forEach((p) => {
      const pathItem: PathItemObject = data.paths[p];
      Object.keys(pathItem).forEach((key) => {
        const method: OperationObject = pathItem[key];
        if (method && method.tags && method.tags.length) {
          method.tags = method.tags.map((tag) => {
            const tagItem = data.tags!.find((t) => t.name === tag);
            if (!tagItem || !tagItem.description) {
              return tag;
            }
            return tagItem.description.replace(/ /g, '');
          });
        }
      });
    });
  }

  if (!data.openapi || !data.openapi.startsWith('3.0.')) {
    throw new Error('数据格式不正确，仅支持 OAS 3.0/Swagger 2.0');
  }

  const apis: RouteMetadataType[] = [];
  Object.keys(data.paths).forEach(path => {
    const pathItem: PathItemObject = data.paths[path];

    if (path.indexOf('$') === -1) {
      const url = path.replace(/{([^}]*)}/gi, ({ }, str) => {
        return `\$\{${str}\}`;
      });

      for (const method in pathItem) {
        const data: OperationObject = pathItem[method];
        if (data) {
          const requestBody: RequestBodyObject = data.requestBody || {} as any;
          apis.push({
            method,
            url,
            className: data.tags[0] || 'Default',
            functionName: data.operationId,
            name: data.summary,
            description: data.description,
            params: getParams(data.parameters, requestBody),
            response: getResponse(data.responses),
            contentType: requestBody.content && Object.keys(requestBody.content)[0] || '',
          } as RouteMetadataType);
        }
      }
    }
  });

  genAPISDK(apis, config);
}

const getParams = (
  parameters: (ParameterObject | ReferenceObject)[] = [], requestBody: RequestBodyObject = {} as any
) => {
  const params = [].concat((parameters || []).map((p: ParameterObject) => {
    // TODO process refer
    return {
      name: p.name,
      paramName: p.name,
      type: getType(p.schema),
      in: p.in,
      required: p.required || false,
    };
  })) as ParamType[];

  const postData = requestBody.content && (requestBody.content['application/json'].schema as SchemaObject).properties || {};
  for (const k in postData) {
    params.push({
      name: k,
      paramName: k,
      in: 'body',
      type: getType(postData[k]),
    });
  }

  return params;
};

const getResponse = (responses: ResponsesObject): ParamType[] => {
  const response = [] as ParamType[];

  for (const k in responses) {
    response.push({
      name: k,
      paramName: k,
      type: 'string',
      in: 'body',
    });
  }

  return response;
};
