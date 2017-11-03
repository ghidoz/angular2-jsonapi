import { format, parse } from 'date-fns';
import { AttributeMetadata } from '../constants/symbols';

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

    const saveAnnotations = function () {
      const metadata = Reflect.getMetadata('Attribute', target) || {};

      metadata[propertyName] = {
        marked: true
      };

      Reflect.defineMetadata('Attribute', metadata, target);

      const mappingMetadata = Reflect.getMetadata('AttributeMapping', target) || {};
      const serializedPropertyName = serializedName !== undefined ? serializedName : propertyName;
      mappingMetadata[serializedPropertyName] = propertyName;
      Reflect.defineMetadata('AttributeMapping', mappingMetadata, target);
    };

    const setMetadata = function (
      hasDirtyAttributes: boolean,
      instance: any,
      oldValue: any,
      newValue: any,
      isNew: boolean
    ) {
      const targetType = Reflect.getMetadata('design:type', target, propertyName);

      if (!instance[AttributeMetadata]) {
        instance[AttributeMetadata] = {};
      }

      const propertyHasDirtyAttributes = typeof oldValue === 'undefined' && !isNew ? false : hasDirtyAttributes;

      instance[AttributeMetadata][propertyName] = {
        newValue,
        oldValue,
        serializedName,
        hasDirtyAttributes: propertyHasDirtyAttributes,
        serialisationValue: converter(targetType, newValue, true)
      };
    };

    const getter = function () {
      return this['_' + propertyName];
    };

    const setter = function (newVal: any) {
      const targetType = Reflect.getMetadata('design:type', target, propertyName);
      const convertedValue = converter(targetType, newVal);

      if (convertedValue !== this['_' + propertyName]) {
        setMetadata(true, this, this['_' + propertyName], newVal, !this.id);
        this['_' + propertyName] = convertedValue;
      }
    };

    if (delete target[propertyName]) {
      saveAnnotations();
      Object.defineProperty(target, propertyName, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
      });
    }
  };
}
