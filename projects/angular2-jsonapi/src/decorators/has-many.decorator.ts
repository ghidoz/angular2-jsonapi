export function HasMany(config: any = {}) {
  return (target: any, propertyName: string | symbol) => {
    const annotations = Reflect.getMetadata('HasMany', target) || [];

    annotations.push({
      propertyName,
      relationship: config.key || propertyName
    });

    Reflect.defineMetadata('HasMany', annotations, target);
  };
}
