import { LinksModel } from './links.model';

export class DocumentModel<T> {
    _links: LinksModel = new LinksModel;
    _data: T;

    constructor(body: any) {
        this._links.updateLinks(body.links);
    }

    public links(name: string = null) {
        return this._links.links(name);
    }

    public data(): T {
        return this._data;
    }

    public setData(data: any) {
        this._data = data;
    }
}
