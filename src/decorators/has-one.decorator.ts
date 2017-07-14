export function HasOne(config: any = {}) {
  return function (target: any, propertyName: string | symbol) {
    let annotations = Reflect.getMetadata('HasOne', target) || [];
    annotations.push({
      propertyName: propertyName,
      relationship: config.key || propertyName
    });
    Reflect.defineMetadata('HasOne', annotations, target);
  };
}
