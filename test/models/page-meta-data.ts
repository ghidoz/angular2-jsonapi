
export class MetaData {
    page: PageData
}

export interface PageData {
    total?: number;
    number?: number;
    size?: number;
    last?: number;
}

export class PageMetaData {
    public meta: PageData = {}
}
