import { JsonApiMetaModel } from '../models/json-api-meta.model';

export interface JsonApiModelConfigDecoratorOptions {
  type?: string;
  baseUrl?: string | undefined;
  apiVersion?: string | undefined;
  modelEndpointUrl?: string | undefined;
  meta?: any;
}
