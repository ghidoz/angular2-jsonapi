import {JsonApiMetaModel} from '../models/json-api-meta.model';

export function JsonApiModelConfig(config: any = {}) {
    return function (target: any) {
        if (typeof config['meta'] === 'undefined' || config['meta'] == null) {
            config['meta'] = JsonApiMetaModel;
        }
        Reflect.defineMetadata('JsonApiModelConfig', config, target);
    };
}
