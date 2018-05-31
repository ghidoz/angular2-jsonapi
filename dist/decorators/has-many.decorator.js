"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function HasMany(config) {
    if (config === void 0) { config = {}; }
    return function (target, propertyName) {
        var annotations = Reflect.getMetadata('HasMany', target) || [];
        annotations.push({
            propertyName: propertyName,
            relationship: config.key || propertyName
        });
        Reflect.defineMetadata('HasMany', annotations, target);
    };
}
exports.HasMany = HasMany;
//# sourceMappingURL=has-many.decorator.js.map