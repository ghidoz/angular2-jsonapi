import {JsonApiModel} from './json-api.model';

export class JsonApiQueryData<T> {
    constructor(protected jsonApiModels: Array<any>, protected metaData?: any) {
    }

    public getModels<T extends JsonApiModel>(): T[] {
        return this.jsonApiModels;
    }

    public getMeta(): any {
        return this.metaData;
    }
}
