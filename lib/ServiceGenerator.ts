import * as fs from 'fs';
import * as path from 'path';
import * as nunjucks from 'nunjucks';
import {
  OpenAPIObject, SchemaObject, ReferenceObject,
  ParameterObject, RequestBodyObject, ContentObject, ResponseObject, ResponsesObject, OperationObject,
} from 'openapi3-ts';

export class GenConfig {
  /** 生成目录 */
  sdkDir: string;
  /** Service模板文件路径 */
  templatePath?: string;
  /** Interface模板文件路径 */
  interfaceTemplatePath?: string;
  /** 生成请求库 */
  requestLib?: boolean = true;
  /** filename style, true 为大驼峰，lower 为小驼峰 */
  camelCase?: boolean | 'lower' = false;
  /** gen type */
  type?: 'ts' | 'js' = 'ts';
  /** 生成 Service 类型 */
  serviceType?: 'function' | 'class' = 'function';
  /** 复杂类型命名空间 */
  namespace?: string = 'API';
  /** 自动清除旧文件时忽略列表 */
  ignoreDelete?: string[] = [];
}

export interface APIDataType extends OperationObject {
  path: string;
  method: string;
}

export interface TagAPIDataType {
  [tag: string]: APIDataType[];
}


export class ServiceGenerator {
  constructor(
    private config: GenConfig,
    private apiData: TagAPIDataType,
    private openAPIData: OpenAPIObject,
  ) {
  }

  genFile() {
    if (fs.existsSync(this.config.sdkDir)) {
      fs.readdirSync(this.config.sdkDir).forEach((file) => {
        if (!['d.ts', '.ts', '.js'].some(ext => path.extname(file) === ext)) {
          return;
        }
        const absoluteFilePath = path.join(this.config.sdkDir, '/', file);
        if ((this.config.ignoreDelete || []).indexOf(file) === -1 && absoluteFilePath !== file) {
          fs.unlinkSync(absoluteFilePath);
        }
      });
    }

    if (this.config.requestLib) {
      this.mkdir(this.config.sdkDir);
      const basePath = path.join(this.config.sdkDir, `base.${this.config.type}`);
      if (!fs.existsSync(basePath)) {
        fs.writeFileSync(basePath, nunjucks.renderString(
          fs.readFileSync(path.join(
            __dirname, 'template', 'base.njk',
          ), 'utf8'), { genType: this.config.type }
        ), 'utf8');
      }
    }

    if (this.config.type === 'ts') {
      this.genInterface();
    }
    this.genService();
  }

  private genInterface() {
    const defines = this.openAPIData.components.schemas;
    const genParams = Object.keys(defines).map(typeName => {
      const props: SchemaObject = this.resolveRefObject(defines[typeName]);

      if (props.type !== 'object') {
        throw new Error(`Unsupported interface type: ${typeName}: ${props.type}`);
      }

      const requiredPropKeys = props.required || [];

      return {
        typeName,
        type: this.getType(props),
        props: props.properties && Object.keys(props.properties).map(propName => {
          const propSchema: SchemaObject = props.properties[propName];
          return {
            ...propSchema,
            name: propName,
            type: this.getType(propSchema),
            desc: [propSchema.title, propSchema.description].filter(s => s).join(' '),
            required: requiredPropKeys.some(key => key === propName)
          };
        }),
      };
    });

    this.genFileFromTemplate(
      'typings.d.ts',
      'interface',
      {
        namespace: this.config.namespace,
        list: genParams
      },
    );
  }

  private genService() {
    Object.keys(this.apiData).forEach(tag => {
      const genParams = this.apiData[tag].map(api => {
        const url = api.path.replace(/{([^}]*)}/gi, ({ }, str) => {
          return `\$\{${str}\}`;
        });
        const params = this.getParamsTemplateParam(api.parameters);
        const body = this.getBodyTemplateParam(api.requestBody);
        const response = this.getResponseTemplateParam(api.responses);
        return {
          ...api,
          path: url,
          method: api.method,
          desc: [api.summary, api.description].filter(s => s).join(' '),
          hasHeader: !!(params && params.header) || !!(body && body.mediaType),
          params,
          body,
          response,
        };
      });

      this.genFileFromTemplate(
        this.getFinalFileName(`${tag}.${this.config.type}`),
        'service',
        {
          genType: this.config.type,
          list: genParams,
        },
      );
    });
  }

  private getBodyTemplateParam(requestBody?: any) {
    const reqBody: RequestBodyObject = this.resolveRefObject(requestBody);
    if (!reqBody) {
      return;
    }
    const reqContent: ContentObject = reqBody.content;
    if (typeof reqContent !== 'object') {
      return;
    }
    const mediaType = Object.keys(reqContent)[0];
    const schema = reqContent[mediaType].schema;
    return {
      mediaType,
      type: this.getType(schema, this.config.namespace),
    };
  }

  private getResponseTemplateParam(responses?: ResponsesObject) {
    const response: ResponseObject = this.resolveRefObject(responses.default || responses['200']);
    const defaultResponse = {
      mediaType: '*/*',
      type: 'any',
    };
    if (!response) {
      return defaultResponse;
    }
    const resContent: ContentObject = response.content;
    if (typeof resContent !== 'object') {
      return defaultResponse;
    }
    const mediaType = Object.keys(resContent)[0];
    const schema = resContent[mediaType].schema;
    return {
      mediaType,
      type: this.getType(schema, this.config.namespace),
    };
  }

  private getParamsTemplateParam(parameters?: (ParameterObject | ReferenceObject)[]) {
    if (!parameters || !parameters.length) {
      return;
    }
    const templateParams: { [key: string]: ParameterObject[] } = {};
    ['query', 'header', 'path', 'cookie'].forEach(where => {
      const params = parameters
        .map(p => this.resolveRefObject<ParameterObject>(p))
        .filter((p: ParameterObject) => p.in === where)
        .map(p => ({
          ...p,
          type: this.getType(p.schema, this.config.namespace),
        }));

      if (params.length) {
        templateParams[where] = params;
      }
    });
    return templateParams;
  }

  private genFileFromTemplate(fileName: string, type: 'interface' | 'service', params: any) {
    const template = this.getTemplate(type);
    const fileContent = nunjucks.renderString(template, params);
    const filePath = path.join(
      this.config.sdkDir,
      fileName,
    );
    this.mkdir(path.dirname(filePath));
    fs.writeFileSync(filePath, fileContent, { encoding: 'utf8' });
  }

  private getTemplate(type: 'interface' | 'service') {
    const configFilePath = type === 'interface' ? this.config.interfaceTemplatePath :
      this.config.templatePath;

    if (configFilePath) {
      this.mkdir(path.dirname(configFilePath));
      if (fs.existsSync(configFilePath)) {
        return fs.readFileSync(configFilePath, 'utf8');
      }
    }

    const fileContent = fs.readFileSync(path.join(
      __dirname, 'template',
      type === 'service' ? `${type}.${this.config.serviceType}.njk` : `${type}.njk`,
    ), 'utf8');
    if (configFilePath) {
      fs.writeFileSync(configFilePath, fileContent, 'utf8');
    }
    return fileContent;
  }

  private resolveRefObject<T>(refObject: any): T {
    if (!refObject || !refObject.$ref) {
      return refObject;
    }
    const refPaths = refObject.$ref.split('/');
    if (refPaths[0] === '#') {
      refPaths.shift();
      let obj: any = this.openAPIData;
      refPaths.forEach((node: any) => {
        obj = obj[node];
      });
      return obj.$ref ? this.resolveRefObject(obj) : obj;
    }
  }

  private getRefName(refObject: any) {
    if (typeof refObject !== 'object' || !refObject.$ref) {
      return refObject;
    }
    const refPaths = refObject.$ref.split('/');
    return refPaths[refPaths.length - 1] as string;
  }

  private mkdir(dir: string) {
    if (!fs.existsSync(dir)) {
      this.mkdir(path.dirname(dir));
      fs.mkdirSync(dir);
    }
  }

  private getFinalFileName(fileName: string) {
    if (this.config.camelCase === true) {
      return this.toCamelCase(fileName);
    } else if (this.config.camelCase === 'lower') {
      fileName = this.toCamelCase(fileName);
      return `${fileName[0].toLowerCase()}${fileName.substr(1)}`;
    }
    return this.toHyphenCase(fileName);
  }

  private toHyphenCase(s: string) {
    s = s.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (s.startsWith('_')) {
      s = s.substr(1);
    }
    return s;
  }

  private toCamelCase(s: string) {
    return s.replace(/_(\w)/g, function (_all, letter) {
      return letter.toUpperCase();
    });
  }

  private getType(schemaObject: SchemaObject, namespace: string = ''): string {
    if (schemaObject.$ref) {
      return [namespace, this.getRefName(schemaObject)].filter(s => s).join('.');
    }

    switch (schemaObject && schemaObject.type) {
      case 'number':
      case 'int':
      case 'integer':
      case 'long':
      case 'float':
      case 'double':
        return 'number';

      case 'Date':
      case 'date':
      case 'dateTime':
      case 'datetime':
        return 'Date';

      case 'string':
      case 'email':
      case 'password':
      case 'url':
      case 'byte':
      case 'binary':
        return schemaObject.enum ? schemaObject.enum.map(v => `'${v}'`).join(' | ') || 'string' : 'string';

      case 'boolean':
        return 'boolean';

      case 'array':
        return `${this.getType(schemaObject.items, namespace)}[]`;

      default:
        return 'any';
    }
  }

}
