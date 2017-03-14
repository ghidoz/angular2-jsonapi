export class JsonApiQueryData<T> {
    constructor(protected jsonApiModels: Array<T>, protected metaData?: any) {
    }

    public getModels(): T[] {
        return this.jsonApiModels;
    }

    public getMeta(): any {
        return this.metaData;
    }
}
