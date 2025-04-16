export class JsonRpcError extends Error {
  private data: Readonly<any | undefined>;

  constructor(readonly code: number, readonly message: string, data?: any) {
    super(`JsonRpcError(code = ${code}, message = ${message})`);
    this.data = Object.freeze(data);
  }
}
