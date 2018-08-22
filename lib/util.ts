import * as fs from 'fs';
import * as path from 'path';

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
