const validTypeName = /^[a-zA-Z0-9_]*$/;
const prefix = '#/definitions/';

export function fixRefSwagger(data: any) {
  const refMap: { [key: string]: any[] } = {};
  Object.keys(data.definitions || {}).forEach(key => {
    refMap[key] = [];
  });

  findRef(data).forEach(refItem => {
    const $ref: string = refItem.$ref;

    if (!$ref.startsWith(prefix)) {
      throw new Error(`未实现解析: ${$ref}`);
    }
    const key = $ref.replace(prefix, '');
    if (!refMap[key]) {
      console.warn(`未找到类型定义: ${$ref}`);
      delete refItem.$ref;
      refItem.type = 'any';
      return;
    }
    refMap[key].push(refItem);
  });

  let count = 0;
  Object.keys(refMap).forEach(key => {
    if (!validTypeName.test(key)) {
      let newName = key.replace('«', '_').replace('»', '');
      newName = validTypeName.test(newName) ? newName : `DTO_${count}`;

      data.definitions[newName] = data.definitions[key];
      delete data.definitions[key];

      refMap[key].forEach(refItem => {
        refItem.$ref = `${prefix}${newName}`;
      });
      count++;
    }
  });
}

function findRef(object: any) {
  if (object.$ref) {
    return [object];
  }
  const list: any[] = [];
  Object.keys(object).forEach(key => {
    if (typeof object === 'object') {
      list.push(...findRef(object[key]));
    }
  });
  return list;
}
