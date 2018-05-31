import { Overrides } from './overrides.interface';
export interface DatastoreConfig {
    apiVersion?: string;
    baseUrl?: string;
    models?: object;
    overrides?: Overrides;
}
