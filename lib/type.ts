// #region public
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
  params: ParamType[];
}

export interface ParamType {
  /** 函数参数名 */
  name: string;
  /** 请求参数名 */
  paramName: string;
  /** 类型 */
  type: string;
  in: 'path' | 'query' | 'body';
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
}
// #endregion public

export interface TemplateRouteType extends RouteMetadataType {
  /** path中参数定义 */
  paramsInPath: ParamType[];
}

export interface TemplateVarType {
  [key: string]: TemplateRouteType[];
}
