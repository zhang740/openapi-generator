# api-gensdk

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/api-gensdk.svg?style=flat-square
[npm-url]: https://npmjs.org/package/api-gensdk
[travis-image]: https://img.shields.io/travis/zhang740/api-gensdk.svg?style=flat-square
[travis-url]: https://travis-ci.org/zhang740/api-gensdk
[codecov-image]: https://codecov.io/github/zhang740/api-gensdk/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/zhang740/api-gensdk?branch=master
[david-image]: https://img.shields.io/david/zhang740/api-gensdk.svg?style=flat-square
[david-url]: https://david-dm.org/zhang740/api-gensdk
[snyk-image]: https://snyk.io/test/npm/api-gensdk/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/api-gensdk
[download-image]: https://img.shields.io/npm/dm/api-gensdk.svg?style=flat-square
[download-url]: https://npmjs.org/package/api-gensdk

# Quick View
```ts
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
}
```

### genAPISDK
`function genAPISDK(data: RouteMetadataType[], config: GenConfig) => void`
