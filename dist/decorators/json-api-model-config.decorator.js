"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var json_api_meta_model_1 = require("../models/json-api-meta.model");
function JsonApiModelConfig(config) {
    return function (target) {
        if (typeof config.meta === 'undefined' || config.meta == null) {
            config.meta = json_api_meta_model_1.JsonApiMetaModel;
        }
        Reflect.defineMetadata('JsonApiModelConfig', config, target);
    };
}
exports.JsonApiModelConfig = JsonApiModelConfig;
//# sourceMappingURL=json-api-model-config.decorator.js.map