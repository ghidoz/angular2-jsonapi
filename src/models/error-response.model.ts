export interface Error {
    id?: string;
    links ?: Array<any>;
    status ?: string;
    code ?: string;
    title ?: string;
    detail ?: string;
    source ?: {
        pointer ?: string;
        parameter ?: string
    };
    meta ?: any;
}

export class ErrorResponse {
    errors?: Error[] = [];

    constructor(errors ?: Error[]) {
        if (errors) {
            this.errors = errors;
        }
    }
}
