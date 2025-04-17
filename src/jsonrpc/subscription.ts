export class Subscription {
  constructor(
    readonly id: number,
    readonly method: string,
    private _unsubscribe: () => Promise<void>
  ) {}

  unsubscribe(): Promise<void> {
    return this._unsubscribe();
  }
}
