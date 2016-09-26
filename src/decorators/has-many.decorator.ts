import 'reflect-metadata';

export function HasMany(config: any = {}) {
  return function (target: any, propertyName: string | symbol) {
    let annotations = Reflect.getMetadata('HasMany', target) || [];
    annotations.push({
      propertyName: propertyName,
      relationship: config.key || propertyName
    });
    Reflect.defineMetadata('HasMany', annotations, target);
  };
}
