import 'reflect-metadata';

export function HasMany(config: any = {}) {
  return function(target: any, attributeName: string | symbol) {
    let annotations = Reflect.getMetadata('HasMany', target) || [];
    let type = Reflect.getMetadata('design:type', target, attributeName);
    annotations.push({
        attribute: attributeName,
        name: config.name || attributeName,
        type: config.type || type
    });
    Reflect.defineMetadata('HasMany', annotations, target);
  };
}
