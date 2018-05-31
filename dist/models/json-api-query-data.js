"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JsonApiQueryData = /** @class */ (function () {
    function JsonApiQueryData(jsonApiModels, metaData) {
        this.jsonApiModels = jsonApiModels;
        this.metaData = metaData;
    }
    JsonApiQueryData.prototype.getModels = function () {
        return this.jsonApiModels;
    };
    JsonApiQueryData.prototype.getMeta = function () {
        return this.metaData;
    };
    return JsonApiQueryData;
}());
exports.JsonApiQueryData = JsonApiQueryData;
//# sourceMappingURL=json-api-query-data.js.map