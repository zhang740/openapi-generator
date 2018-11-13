require('colorful').colorful();
import * as path from 'path';
import * as program from 'commander';
import { genSDK, genFromUrl } from '../';
let packageInfo = require('../../package.json');

program.version(packageInfo.version);

program
  .command('url <url>')
  .description('swagger2/oas3 json data url')
  .option('-d, --sdkDir <sdkDir>', 'sdkDir, default: process.cwd()/service')
  .option('-t, --templatePath <templatePath>', 'templatePath')
  .option('-t, --type <type>', 'ts/js, default ts', /^(ts|js)$/i)
  .option('-c, --camelCase <camelCase>', 'filename style, true 为大驼峰，lower 为小驼峰', /^(true|lower)$/i)
  .action(function (url, opt) {
    const { sdkDir, type, camelCase, templatePath } = opt;
    if (!url) {
      console.error('[Api-GenSDK] err NEED Url');
      return;
    }
    genFromUrl({
      api: url,
      sdkDir: sdkDir || `${process.cwd()}/service`,
      templatePath,
      type: type || 'ts',
      camelCase: camelCase === 'true' ? true : camelCase,
    })
      .then(_ => process.exit(0))
      .catch(error => console.log('[Api-GenSDK] err:\n', error));
  });

program
  .command('config <cfgPath>')
  .description('config path')
  .action(function (cfgPath) {
    if (!cfgPath) {
      console.error('[Api-GenSDK] err NEED config file path');
      return;
    }
    cfgPath = path.isAbsolute(cfgPath) ? cfgPath : path.join(process.cwd(), cfgPath);
    genSDK(cfgPath)
      .then(_ => process.exit(0))
      .catch(error => console.log('[Api-GenSDK] err:\n', error));
  });

program
  .command('*')
  .action(function () {
    program.help();
  });

program.parse(process.argv);

let proc = program.runningCommand;
if (proc) {
  proc.on('close', process.exit.bind(process));
  proc.on('error', () => {
    process.exit(1);
  });
}

process.on('SIGINT', () => {
  if (proc) {
    proc.kill('SIGKILL');
  }
  process.exit(0);
});

if (!program.args || program.args.length < 1) {
  program.help();
}
