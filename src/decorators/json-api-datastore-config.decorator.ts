export function JsonApiDatastoreConfig(config: any = {}) {
  return function (target: any) {
    Reflect.defineMetadata('JsonApiDatastoreConfig', config, target);
  };
}
