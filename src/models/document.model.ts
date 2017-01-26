export class DocumentModel {
    errors?: any[];
    data?: any | any[];
    meta?: any;
    links?: any;

    constructor(errors?: any[], data?: any, links?: any, meta?: any) {
        this.errors = errors;
        this.data = data;
        this.links = links;
        this.meta = meta;
    }
}
