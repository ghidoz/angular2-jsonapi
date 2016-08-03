import 'reflect-metadata';

export function HasMany(config: any = {}) {
  return function(target: any, attributeName: string | symbol) {
    let annotations = Reflect.getMetadata('HasMany', target) || [];
    annotations.push({
        attribute: attributeName,
        key: config.key || attributeName
    });
    Reflect.defineMetadata('HasMany', annotations, target);
  };
}
