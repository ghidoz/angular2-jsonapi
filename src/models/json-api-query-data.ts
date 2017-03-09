import {JsonApiModel} from './json-api.model';

export class JsonApiQueryData {
    constructor(public jsonApiModels: Array<any>, public metaData?: any) {
    }

    public getModels<T extends JsonApiModel>(): T[] {
        return this.jsonApiModels;
    }

    public getMeta(): any {
        return this.metaData;
    }
}
