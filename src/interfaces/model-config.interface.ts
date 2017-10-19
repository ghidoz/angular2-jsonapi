import { JsonApiMetaModel } from '../models/json-api-meta.model';

export interface ModelConfig {
  type: string;
  apiVersion?: string;
  baseUrl?: string;
  modelEndpointUrl?: string;
  meta?: JsonApiMetaModel;
}
