import * as path from 'path';
import { OpenAPIObject, PathItemObject, OperationObject } from 'openapi3-ts';
import { s2o, fixRefSwagger, requestData } from './util';
import { ServiceGenerator, GenConfig, TagAPIDataType } from './ServiceGenerator';

export interface CliConfig extends GenConfig {
  api: string;
}

export async function genSDK(cfgPath: string) {
  let configs: CliConfig[];
  configs = require(cfgPath);
  if ((configs as any).__esModule) {
    configs = (configs as any).default;
  }
  configs = [].concat(configs);
  console.log('[GenSDK] read config as js');

  return Promise.all(configs.map(cfg => {
    const { api, ...rest } = {
      ...new GenConfig,
      ...cfg,
    };
    rest.sdkDir = getAbsolutePath(rest.sdkDir);
    rest.interfaceTemplatePath = getAbsolutePath(rest.interfaceTemplatePath);
    rest.templatePath = getAbsolutePath(rest.templatePath);
    return genFromUrl(api, rest);
  }));
}

export async function genFromUrl(url: string, config: GenConfig) {
  console.log('[GenSDK] load', url);
  let data: OpenAPIObject = JSON.parse(await requestData(url));

  if (!data || !data.paths || !data.info) {
    throw new Error('数据格式不正确');
  }

  if (data.swagger === '2.0') {
    fixRefSwagger(data);
    data = await s2o(data);

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

  if (!data.openapi || !data.openapi.startsWith('3.')) {
    throw new Error('数据格式不正确，仅支持 OpenAPI 3.0/Swagger 2.0');
  }

  const apiData: TagAPIDataType = {};

  Object.keys(data.paths).forEach(path => {
    const pathItem: PathItemObject = data.paths[path];

    ['get', 'put', 'post', 'delete'].forEach(method => {
      const operationObject: OperationObject = pathItem[method];
      if (operationObject) {
        operationObject.tags.forEach(tag => {
          if (!apiData[tag]) {
            apiData[tag] = [];
          }
          apiData[tag].push({
            path,
            method,
            ...operationObject,
          });
        });
      }
    });
  });

  const generator = new ServiceGenerator(config, apiData, data);
  generator.genFile();
}

function getAbsolutePath(filePath: string) {
  return filePath ?
    path.isAbsolute(filePath) ?
      path.join(process.cwd(), filePath) :
      filePath
    : filePath;
}
