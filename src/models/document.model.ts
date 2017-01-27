import { LinksModel } from './links.model';

export class DocumentModel<T> {
  private _links: LinksModel = new LinksModel;
  private _data: T;

  constructor(body: any) {
    this._links.updateLinks(body.links);
  }

  get links() {
    return this._links;
  }

  get data(): T {
    return this._data;
  }

  set data(data: T) {
    this._data = data;
  }
}
