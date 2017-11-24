export interface Overrides {
  getDirtyAttributes?: (attributedMetadata: any) => object;
  toQueryString?: (params: any) => string;
}
