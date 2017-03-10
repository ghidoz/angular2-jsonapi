import { JsonApiModel } from './json-api.model';
export declare class JsonApiQueryData {
    jsonApiModels: Array<any>;
    metaData: any;
    constructor(jsonApiModels: Array<any>, metaData?: any);
    getModels<T extends JsonApiModel>(): T[];
    getMeta(): any;
}
