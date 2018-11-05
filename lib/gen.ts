import * as fs from 'fs';
import * as path from 'path';
import * as nunjucks from 'nunjucks';
import { toCamelCase, toHyphenCase, mkdir, functionNameRD } from './util';
import { RouteMetadataType, GenConfig, TemplateVarType } from './type';

function genDefaultTemplate(config: GenConfig) {
  const templatePath = config.templatePath || path.join(config.sdkDir, 'sdk.njk');
  if (!fs.existsSync(templatePath)) {
    console.log(`[GenSDK] Not found template! ${templatePath}`);
    try {
      fs.writeFileSync(templatePath, fs.readFileSync(path.join(__dirname, 'sdk.njk')));

      const baseServiceFile = path.join(path.parse(templatePath).dir, `base.${config.type}`);
      if (!fs.existsSync(baseServiceFile)) {
        const fileContent = nunjucks.renderString(
          fs.readFileSync(path.join(__dirname, 'base.njk'), 'utf-8'), {
            genType: config.type,
          });
        fs.writeFileSync(baseServiceFile, fileContent);
      }
    } catch (error) {
      console.log('[GenSDK] Write default template error!', error);
      return;
    }
  }
  return templatePath;
}

/**
 * 生成APISDK
 * @param sdkDir
 * @param templatePath
 * @param config
 */
export function genAPISDK(data: RouteMetadataType[], config: GenConfig) {
  config = { ...new GenConfig, ...config || {} };
  const { sdkDir } = config;

  mkdir(sdkDir);

  const templatePath = genDefaultTemplate(config);

  // 模版中函数支持的变量
  const metadata: TemplateVarType = {};

  // 数据分类
  data.forEach(route => {
    const ClassName = route.className;

    if (!metadata[ClassName]) {
      metadata[ClassName] = [];
    }

    metadata[ClassName].push({
      ...route,
      paramsInPath: route.params.filter(p => p.in === 'path')
    });
  });

  functionNameRD(metadata);

  const fileTemplate = fs.readFileSync(templatePath, 'utf8');
  Object.keys(metadata).forEach(className => {
    const typeName = className.replace('Controller', '');

    const fileContent = nunjucks.renderString(fileTemplate, {
      genType: config.type,
      className: typeName,
      instanceName: typeName[0].toLowerCase() + typeName.slice(1),
      methodMetadata: metadata[className],
    });

    let name = config.camelCase ?
      toCamelCase(typeName) : toHyphenCase(typeName);
    if (config.camelCase === 'lower') {
      name = `${name[0].toLowerCase()}${name.substr(1)}`;
    }
    const filePath = path.join(
      sdkDir,
      `${name}.${config.type}`,
    );
    fs.writeFileSync(filePath, fileContent, { encoding: 'utf8' });
    console.log('[GenSDK] gen', filePath);
  });
}
