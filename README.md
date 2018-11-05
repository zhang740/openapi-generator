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

gensdk from swagger 2.0 or OpenAPI 3.0:

## Simple

`gensdk url http://xxx/v2/api-docs -c true`

## Use Config

`gensdk config ./xxx.js` or `gensdk config ./xxx.json`

Config interface:

```ts
interface CliConfig {
  api: string;
  /** dir for gensdk */
  sdkDir: string;
  /** path for template */
  templatePath: string;
  /** filename style, true 为大驼峰，lower 为小驼峰 */
  camelCase?: boolean | 'lower' = false;
  /** gen type */
  type?: 'ts' | 'js' = 'ts';
}
```

### genAPISDK

`function genAPISDK(data: RouteMetadataType[], config: GenConfig) => void`
