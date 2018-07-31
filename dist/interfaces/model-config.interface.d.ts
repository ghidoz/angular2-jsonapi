import { MetaModelType } from '../models/json-api-meta.model';
export interface ModelConfig<T = any> {
    type: string;
    apiVersion?: string;
    baseUrl?: string;
    modelEndpointUrl?: string;
    meta?: MetaModelType<T>;
}
