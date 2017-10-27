import { format, parse } from 'date-fns';

export function Attribute(serializedName?: string) {
  return function (target: any, propertyName: string) {
    const converter = function (dataType: any, value: any, forSerialisation = false): any {
      if (!forSerialisation) {
        if (dataType === Date) {
          return parse(value);
        }
      } else {
        if (dataType === Date) {
          return format(value, 'YYYY-MM-DDTHH:mm:ss[Z]');
        }
      }

      return value;
    };

    const saveAnnotations = function (hasDirtyAttributes: boolean, oldValue: any, newValue: any, isNew: boolean) {
      const annotations = Reflect.getMetadata('Attribute', target) || {};
      const targetType = Reflect.getMetadata('design:type', target, propertyName);

      const mappingMetadata = Reflect.getMetadata('AttributeMapping', target) || {};
      const serializedPropertyName = serializedName !== undefined ? serializedName : propertyName;
      mappingMetadata[serializedPropertyName] = propertyName;
      Reflect.defineMetadata('AttributeMapping', mappingMetadata, target);

      const propertyHasDirtyAttributes = typeof oldValue === 'undefined' && !isNew ? false : hasDirtyAttributes;

      annotations[propertyName] = {
        newValue,
        oldValue,
        serializedName,
        hasDirtyAttributes: propertyHasDirtyAttributes,
        serialisationValue: converter(targetType, newValue, true)
      };

      Reflect.defineMetadata('Attribute', annotations, target);
    };

    const getter = function () {
      return this['_' + propertyName];
    };

    const setter = function (newVal: any) {
      const targetType = Reflect.getMetadata('design:type', target, propertyName);
      const convertedValue = converter(targetType, newVal);

      if (convertedValue !== this['_' + propertyName]) {
        saveAnnotations(true, this['_' + propertyName], newVal, !this.id);
        this['_' + propertyName] = convertedValue;
      }
    };

    if (delete target[propertyName]) {
      saveAnnotations(false, undefined, target[propertyName], target.id);
      Object.defineProperty(target, propertyName, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
      });
    }
  };
}
