export type MetaModelType<T> = new(response: any) => T;

export class JsonApiMetaModel {
  public links: Array<any>;
  public meta: any;

  constructor(response: any) {
    this.links = response.links || [];
    this.meta = response.meta;
  }
}
