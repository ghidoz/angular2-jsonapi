"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JsonApiMetaModel = /** @class */ (function () {
    function JsonApiMetaModel(response) {
        this.links = response.links || [];
        this.meta = response.meta;
    }
    return JsonApiMetaModel;
}());
exports.JsonApiMetaModel = JsonApiMetaModel;
//# sourceMappingURL=json-api-meta.model.js.map