import { AttributeMetadata } from '../constants/symbols';
import { AttributeDecoratorOptions } from '../interfaces/attribute-decorator-options.interface';
import * as _ from 'lodash';
import { serialize } from '@angular/compiler/src/i18n/serializers/xml_helper';

export function NestedAttribute(options: AttributeDecoratorOptions = {}): PropertyDecorator {
  return function (target: any, propertyName: string) {
    const converter = function (dataType: any, value: any, forSerialisation = false): any {
      let attrConverter;

      if (options.converter) {
        attrConverter = options.converter;
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
      const metadata = Reflect.getMetadata('NestedAttribute', target) || {};

      metadata[propertyName] = {
        marked: true
      };

      Reflect.defineMetadata('NestedAttribute', metadata, target);

      const mappingMetadata = Reflect.getMetadata('AttributeMapping', target) || {};
      const serializedPropertyName = options.serializedName !== undefined ? options.serializedName : propertyName;
      mappingMetadata[serializedPropertyName] = propertyName;
      Reflect.defineMetadata('AttributeMapping', mappingMetadata, target);
    };

    const updateMetadata = (instance: any) => {
      const newValue = instance[`_${propertyName}`];

      if (!instance[AttributeMetadata]) {
        instance[AttributeMetadata] = {};
      }
      if (instance[AttributeMetadata][propertyName] && !instance.isModelInitialization()) {
        instance[AttributeMetadata][propertyName].newValue = newValue;
        instance[AttributeMetadata][propertyName].hasDirtyAttributes = !_.isEqual(
          instance[AttributeMetadata][propertyName].oldValue,
          newValue
        );
        instance[AttributeMetadata][propertyName].serialisationValue = newValue;
      } else {
        const oldValue = _.cloneDeep(newValue);
        instance[AttributeMetadata][propertyName] = {
          newValue,
          oldValue,
          converter,
          nested: true,
          hasDirtyAttributes: !_.isEqual(newValue, oldValue)
        };
      }
    };

    const getter = function () {
      return this[`_${propertyName}`];
    };

    const setter = function (newVal: any) {
      const targetType = Reflect.getMetadata('design:type', target, propertyName);
      this[`_${propertyName}`] = converter(targetType, newVal);
      updateMetadata(this);
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
