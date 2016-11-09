import 'reflect-metadata';
import * as moment from 'moment';

export function Attribute(config: any = {}) {
  return function (target: any, propertyName: string) {

    let converter = function(dataType: any, value: any, forSerialisation: boolean = false): any {
      if (!forSerialisation) {
        if (dataType === Date) {
          return moment.utc(value).toDate();
        }
      } else {
        if (dataType === Date) {
          return moment(value).format(moment.defaultFormatUtc);
        }
      }

      return value;
    };

    let saveAnnotations = function (hasDirtyAttributes: boolean, oldValue: any, newValue: any, isNew: boolean) {
      let annotations = Reflect.getMetadata('Attribute', target) || {};
      let targetType = Reflect.getMetadata('design:type', target, propertyName);

      hasDirtyAttributes = typeof oldValue === 'undefined' && !isNew ? false : hasDirtyAttributes;
      annotations[propertyName] = {
        hasDirtyAttributes: hasDirtyAttributes,
        oldValue: oldValue,
        newValue: newValue,
        serialisationValue: converter(targetType, newValue, true)
      };
      Reflect.defineMetadata('Attribute', annotations, target);
    };

    let getter = function () {
      return this['_' + propertyName];
    };

    let setter = function (newVal: any) {
      let targetType = Reflect.getMetadata('design:type', target, propertyName);
      let convertedValue = converter(targetType, newVal);
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
