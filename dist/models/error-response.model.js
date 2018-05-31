"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorResponse = /** @class */ (function () {
    function ErrorResponse(errors) {
        this.errors = [];
        if (errors) {
            this.errors = errors;
        }
    }
    return ErrorResponse;
}());
exports.ErrorResponse = ErrorResponse;
//# sourceMappingURL=error-response.model.js.map