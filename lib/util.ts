import * as fs from 'fs';
import * as path from 'path';
import { TemplateVarType } from './type';

export function toHyphenCase(s: string) {
  s = s.replace(/([A-Z])/g, '_$1').toLowerCase();
  if (s.startsWith('_')) {
    s = s.substr(1);
  }
  return s;
}

export function toCamelCase(s: string) {
  return s.replace(/_(\w)/g, function (_all, letter) {
    return letter.toUpperCase();
  });
}

export function mkdir(dir: string) {
  if (!fs.existsSync(dir)) {
    mkdir(path.dirname(dir));
    fs.mkdirSync(dir);
  }
}

/** 函数名防重 */
export function functionNameRD(metadata: TemplateVarType) {
  Object.keys(metadata).forEach(className => {
    const clsMetadata = metadata[className];
    const functionName: { [key: string]: number } = {};
    clsMetadata.forEach(route => {
      const count = functionName[route.functionName];
      if (count) {
        route.functionName += `_${count}`;
      }
      functionName[route.functionName] = count ? count + 1 : 1;
    });
  });
}
