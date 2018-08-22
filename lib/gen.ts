import * as fs from 'fs';
import * as path from 'path';
import * as nunjucks from 'nunjucks';
import { toCamelCase, toHyphenCase, mkdir } from './util';

export interface RouteMetadataType {
  /** 类名 */
  className: string;
  /** 方法名 */
  functionName: string;
  /** 路由名称 */
  name: string;
  /** 路由描述 */
  description: string;
  /** http method */
  method: string;
  /** http url */
  url: string;
  /** 参数定义 */
  params: {
    /** 函数参数名 */
    name: string,
    /** 请求参数名 */
    paramName: string,
    /** 类型 */
    type: string,
  }[];
}

export class GenConfig {
  /** 生成目录 */
  sdkDir: string;
  /** 模版目录 */
  templatePath: string;
  /** filename style */
  camelCase?: boolean = false;
  /** gen type */
  type?: 'ts' | 'js' = 'ts';
  /** route filter */
  filter?: (route: RouteMetadataType) => boolean;
}

function genDefaultTemplate(sdkDir: string, templatePath: string) {
  templatePath = templatePath || path.join(sdkDir, 'sdk.njk');
  if (!fs.existsSync(templatePath)) {
    console.log(`[genAPISDK] Not found template! ${templatePath}`);
    try {
      fs.writeFileSync(templatePath, fs.readFileSync(path.join(__dirname, 'sdk.njk')));

      const baseServiceFile = path.join(path.parse(templatePath).dir, 'base.ts');
      if (!fs.existsSync(baseServiceFile)) {
        fs.writeFileSync(baseServiceFile, fs.readFileSync(path.join(__dirname, 'base.njk')));
      }
    } catch (error) {
      console.log('[genAPISDK] Write default template error!', error);
      return;
    }
  }
}

/**
 * 生成APISDK
 * @param sdkDir
 * @param templatePath
 * @param config
 */
export function genAPISDK(data: RouteMetadataType[], config: GenConfig) {
  config = { ...new GenConfig, ...config || {} };
  let { templatePath, sdkDir } = config;

  mkdir(sdkDir);

  genDefaultTemplate(sdkDir, templatePath);

  // 模版中函数支持的变量
  const metadata: {
    [key: string]: RouteMetadataType[],
  } = {};

  data.forEach(route => {
    const ClassName = route.className;

    if (!metadata[ClassName]) {
      metadata[ClassName] = [];
    }
    metadata[ClassName].push(route);
  });

  const fileTemplate = fs.readFileSync(templatePath, 'utf8');
  Object.keys(metadata).forEach(className => {
    const typeName = className.replace('Controller', '');

    const fileContent = nunjucks.renderString(fileTemplate, {
      genType: config.type,
      className: typeName[0].toLowerCase() + typeName.slice(1),
      methodMetadata: metadata[className],
    });

    const filePath = path.join(
      sdkDir,
      `${config.camelCase ?
        toCamelCase(typeName) : toHyphenCase(typeName)
      }.${config.type}`,
    );
    fs.writeFileSync(filePath, fileContent, { encoding: 'utf8' });
    console.log('[GenSDK] gen', filePath);
  });
}
