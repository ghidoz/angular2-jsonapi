import 'reflect-metadata';

export function Attribute(config: any = {}) {
  return function(target: any, propertyName: string) {

    let saveAnnotations = function (hasDirtyAttributes: boolean, oldValue: any, newValue: any) {
        let annotations = Reflect.getMetadata('Attribute', target) || {};
        annotations[propertyName] = {
            hasDirtyAttributes: hasDirtyAttributes,
            oldValue: oldValue,
            newValue: newValue
        };
        Reflect.defineMetadata('Attribute', annotations, target);
    };

    let _val = target[propertyName];
    saveAnnotations(false, undefined, _val);

    let getter = function () {
        return _val;
    };

    let setter = function (newVal: any) {
        saveAnnotations(true, _val, newVal);
        _val = newVal;
    };

    if (delete target[propertyName]) {
        Object.defineProperty(target, propertyName, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true
        });
    }
  };
}
