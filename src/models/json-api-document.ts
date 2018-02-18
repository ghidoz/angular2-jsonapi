export class JsonApiDocument<T> {
  constructor(protected data: Array<T> | T, protected meta?: any) {}

  public getModels() : T[] {
    if (!(this.data instanceof Array)) {
      throw new Error('Data is not an array.');
    }

    return this.data;
  }

  public getModel() : T {
    if (this.data instanceof Array) {
      throw new Error('Data is not an object.');
    }

    return this.data;
  }

  public getData(): T[] | T {
    return this.data;
  }

  public getMeta(): any {
    return this.meta;
  }
}
