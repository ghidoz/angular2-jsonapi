import * as dateFormat from 'date-fns/format';
import * as dateParse from 'date-fns/parse';
import { AttributeDecoratorOptions } from '../interfaces/attribute-decorator-options.interface';
import { DateConverter } from '../converters/date/date.converter';

export function Attribute(options: AttributeDecoratorOptions = {}): PropertyDecorator {
    return function (target: any, propertyName: string) {
        let converter = function (dataType: any, value: any, forSerialisation = false): any {
            let attrConverter;

            if (options.converter) {
                attrConverter = options.converter;
            } else if (dataType === Date) {
                attrConverter = new DateConverter();
            } else {
                const datatype = new dataType();

                if (datatype.mask && datatype.unmask) {
                  attrConverter = datatype
                }
              }

            if (attrConverter) {
                if (!forSerialisation) {
                    return attrConverter.mask(value);
                } else {
                    return attrConverter.unmask(value);
                }
            }

            return value;
        };

        let saveAnnotations = function (hasDirtyAttributes: boolean, oldValue: any, newValue: any, isNew: boolean) {
            let annotations = Reflect.getMetadata('Attribute', target) || {};
            let targetType = Reflect.getMetadata('design:type', target, propertyName);

            let mappingMetadata = Reflect.getMetadata('AttributeMapping', target) || {};
            let serializedPropertyName = options.serializedName !== undefined ? options.serializedName : propertyName;
            mappingMetadata[serializedPropertyName] = propertyName;
            Reflect.defineMetadata('AttributeMapping', mappingMetadata, target);

            hasDirtyAttributes = typeof oldValue === 'undefined' && !isNew ? false : hasDirtyAttributes;
            annotations[propertyName] = {
                hasDirtyAttributes: hasDirtyAttributes,
                oldValue: oldValue,
                newValue: newValue,
                serializedName: options.serializedName,
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
