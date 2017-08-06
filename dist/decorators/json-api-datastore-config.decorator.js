"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function JsonApiDatastoreConfig(config) {
    if (config === void 0) { config = {}; }
    return function (target) {
        Reflect.defineMetadata('JsonApiDatastoreConfig', config, target);
    };
}
exports.JsonApiDatastoreConfig = JsonApiDatastoreConfig;
//# sourceMappingURL=json-api-datastore-config.decorator.js.map