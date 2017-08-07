"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var providers_1 = require("./providers");
var JsonApiModule = (function () {
    function JsonApiModule() {
    }
    JsonApiModule.decorators = [
        { type: core_1.NgModule, args: [{
                    providers: [providers_1.PROVIDERS],
                    exports: [http_1.HttpModule]
                },] },
    ];
    /** @nocollapse */
    JsonApiModule.ctorParameters = function () { return []; };
    return JsonApiModule;
}());
exports.JsonApiModule = JsonApiModule;
//# sourceMappingURL=module.js.map