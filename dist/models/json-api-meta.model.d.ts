export declare type MetaModelType<T> = {
    new (response: any): T;
};
export declare class JsonApiMetaModel {
    links: Array<any>;
    meta: any;
    constructor(response: any);
}
