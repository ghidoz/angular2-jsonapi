import { JsonApiModel } from './json-api.model';
export declare class JsonApiQueryData<T> {
    protected jsonApiModels: Array<any>;
    protected metaData: any;
    constructor(jsonApiModels: Array<any>, metaData?: any);
    getModels<T extends JsonApiModel>(): T[];
    getMeta(): any;
}
