export function JsonApiDatastoreConfig(config: any = {}) {
  return (target: any) => {
    Reflect.defineMetadata('JsonApiDatastoreConfig', config, target);
  };
}
