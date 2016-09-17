import 'reflect-metadata';

export function Attribute(config: any = {}) {
  return function(target: any, propertyName: string) {

    let saveAnnotations = function (hasDirtyAttributes: boolean, oldValue: any, newValue: any) {
        let annotations = Reflect.getMetadata('Attribute', target) || {};
        hasDirtyAttributes = typeof oldValue === 'undefined' ? false : hasDirtyAttributes;
        annotations[propertyName] = {
            hasDirtyAttributes: hasDirtyAttributes,
            oldValue: oldValue,
            newValue: newValue
        };
        Reflect.defineMetadata('Attribute', annotations, target);
    };

    let getter = function () {
        return this['_' + propertyName];
    };

    let setter = function (newVal: any) {
        if (newVal !== this['_' + propertyName]) {
            saveAnnotations(true, this['_' + propertyName], newVal);
            this['_' + propertyName] = newVal;
        }
    };

    if (delete target[propertyName]) {
        saveAnnotations(false, undefined, target[propertyName]);
        Object.defineProperty(target, propertyName, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true
        });
    }
  };
}
