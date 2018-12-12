export const renameTypePrefix = 'DTO_';
export function testTypeNameValid(name: string) {
  return /^[a-zA-Z0-9_]*$/.test(name);
}
