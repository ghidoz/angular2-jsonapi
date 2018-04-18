import { JsonApiModelConfigDecoratorOptions } from '../interfaces/json-api-model-config-decorator-options.interface';
import { JsonApiMetaModel } from '../models/json-api-meta.model';

export function JsonApiModelConfig(config: JsonApiModelConfigDecoratorOptions = {}) {
  return function (target: any) {
    if (typeof config['meta'] === 'undefined' || config['meta'] == null) {
      config['meta'] = JsonApiMetaModel;
    }

    Reflect.defineMetadata('JsonApiModelConfig', config, target);
  };
}
