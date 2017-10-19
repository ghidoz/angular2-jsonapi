import { format, parse } from 'date-fns';

export function Attribute(serializedName?: string) {
    return function (target: any, propertyName: string) {
        let converter = function (dataType: any, value: any, forSerialisation = false): any {
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

        let saveAnnotations = function (hasDirtyAttributes: boolean, oldValue: any, newValue: any, isNew: boolean) {
            let annotations = Reflect.getMetadata('Attribute', target) || {};
            let targetType = Reflect.getMetadata('design:type', target, propertyName);

            let mappingMetadata = Reflect.getMetadata('AttributeMapping', target) || {};
            let serializedPropertyName = serializedName !== undefined ? serializedName : propertyName;
            mappingMetadata[serializedPropertyName] = propertyName;
            Reflect.defineMetadata('AttributeMapping', mappingMetadata, target);

            hasDirtyAttributes = typeof oldValue === 'undefined' && !isNew ? false : hasDirtyAttributes;
            annotations[propertyName] = {
                hasDirtyAttributes: hasDirtyAttributes,
                oldValue: oldValue,
                newValue: newValue,
                serializedName: serializedName,
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
