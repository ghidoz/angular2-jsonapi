export declare class JsonApiQueryData<T> {
    protected jsonApiModels: Array<T>;
    protected metaData: any;
    constructor(jsonApiModels: Array<T>, metaData?: any);
    getModels(): T[];
    getMeta(): any;
}
