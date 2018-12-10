export class CommonError extends Error {
  constructor(message: string) {
    super(`[OpenAPI-Generator] ${message}`);
  }
}
