import 'reflect-metadata';

export function JsonApiModelConfig(config: any = {}) {
    return function(target: any) {
        Reflect.defineMetadata('JsonApiModelConfig', config, target);
    };
}
