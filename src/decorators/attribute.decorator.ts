import { AttributeMetadata } from '../constants/symbols';
import { AttributeDecoratorOptions } from '../interfaces/attribute-decorator-options.interface';
import { DateConverter } from '../converters/date/date.converter';
import * as _ from 'lodash';

export function Attribute(options: AttributeDecoratorOptions = {}): PropertyDecorator {
  return function (target: any, propertyName: string) {
    const converter = function (dataType: any, value: any, forSerialisation = false): any {
      let attrConverter;

      if (options.converter) {
        attrConverter = options.converter;
      } else if (dataType === Date) {
        attrConverter = new DateConverter();
      } else {
        const datatype = new dataType();

        if (datatype.mask && datatype.unmask) {
          attrConverter = datatype;
        }
      }

      if (attrConverter) {
        if (!forSerialisation) {
          return attrConverter.mask(value);
        }
        return attrConverter.unmask(value);
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
      const serializedPropertyName = options.serializedName !== undefined ? options.serializedName : propertyName;
      mappingMetadata[serializedPropertyName] = propertyName;
      Reflect.defineMetadata('AttributeMapping', mappingMetadata, target);
    };

    const setMetadata = function (
      instance: any,
      oldValue: any,
      newValue: any
    ) {
      const targetType = Reflect.getMetadata('design:type', target, propertyName);

      if (!instance[AttributeMetadata]) {
        instance[AttributeMetadata] = {};
      }
      instance[AttributeMetadata][propertyName] = {
        newValue,
        oldValue,
        nested:false,
        serializedName: options.serializedName,
        hasDirtyAttributes: !_.isEqual(oldValue, newValue),
        serialisationValue: converter(targetType, newValue, true)
      };
    };

    const getter = function () {
      return this[`_${propertyName}`];
    };

    const setter = function (newVal: any) {
      const targetType = Reflect.getMetadata('design:type', target, propertyName);
      const convertedValue = converter(targetType, newVal);
      let oldValue = null;
      if (this.isModelInitialization() && this.id) {
        oldValue = converter(targetType, newVal);
      } else {
        if (this[AttributeMetadata] && this[AttributeMetadata][propertyName]) {
          oldValue = this[AttributeMetadata][propertyName]['oldValue'];
        }
      }

      this[`_${propertyName}`] = convertedValue;
      setMetadata(this, oldValue, convertedValue);
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
