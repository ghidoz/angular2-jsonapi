"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var date_fns_1 = require("date-fns");
var DateConverter = /** @class */ (function () {
    function DateConverter() {
    }
    DateConverter.prototype.mask = function (value) {
        return date_fns_1.parse(value);
    };
    DateConverter.prototype.unmask = function (value) {
        return date_fns_1.format(value, 'YYYY-MM-DDTHH:mm:ssZ');
    };
    return DateConverter;
}());
exports.DateConverter = DateConverter;
//# sourceMappingURL=date.converter.js.map