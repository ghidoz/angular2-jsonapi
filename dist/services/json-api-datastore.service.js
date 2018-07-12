"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var find_1 = require("lodash-es/find");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/operator/map");
require("rxjs/add/operator/catch");
require("rxjs/add/observable/throw");
require("rxjs/add/observable/of");
var json_api_model_1 = require("../models/json-api.model");
var error_response_model_1 = require("../models/error-response.model");
var json_api_query_data_1 = require("../models/json-api-query-data");
var qs = require("qs");
var symbols_1 = require("../constants/symbols");
var JsonApiDatastore = /** @class */ (function () {
    function JsonApiDatastore(http) {
        this.http = http;
        // tslint:disable-next-line:variable-name
        this._store = {};
        this.toQueryString = this.datastoreConfig.overrides
            && this.datastoreConfig.overrides.toQueryString ?
            this.datastoreConfig.overrides.toQueryString : this._toQueryString;
    }
    Object.defineProperty(JsonApiDatastore.prototype, "getDirtyAttributes", {
        // tslint:enable:max-line-length
        get: function () {
            if (this.datastoreConfig.overrides
                && this.datastoreConfig.overrides.getDirtyAttributes) {
                return this.datastoreConfig.overrides.getDirtyAttributes;
            }
            else {
                return JsonApiDatastore.getDirtyAttributes;
            }
        },
        enumerable: true,
        configurable: true
    });
    /** @deprecated - use findAll method to take all models **/
    JsonApiDatastore.prototype.query = function (modelType, params, headers, customUrl) {
        var _this = this;
        var requestHeaders = this.buildHeaders(headers);
        var url = this.buildUrl(modelType, params, undefined, customUrl);
        return this.http.get(url, { headers: requestHeaders })
            .map(function (res) { return _this.extractQueryData(res, modelType); })
            .catch(function (res) { return _this.handleError(res); });
    };
    JsonApiDatastore.prototype.findAll = function (modelType, params, headers, customUrl) {
        var _this = this;
        var requestHeaders = this.buildHeaders(headers);
        var url = this.buildUrl(modelType, params, undefined, customUrl);
        return this.http.get(url, { headers: requestHeaders })
            .map(function (res) { return _this.extractQueryData(res, modelType, true); })
            .catch(function (res) { return _this.handleError(res); });
    };
    JsonApiDatastore.prototype.findRecord = function (modelType, id, params, headers, customUrl) {
        var _this = this;
        var requestHeaders = this.buildHeaders(headers);
        var url = this.buildUrl(modelType, params, id, customUrl);
        return this.http.get(url, { headers: requestHeaders, observe: 'response' })
            .map(function (res) { return _this.extractRecordData(res, modelType); })
            .catch(function (res) { return _this.handleError(res); });
    };
    JsonApiDatastore.prototype.createRecord = function (modelType, data) {
        return new modelType(this, { attributes: data });
    };
    JsonApiDatastore.getDirtyAttributes = function (attributesMetadata) {
        var dirtyData = {};
        for (var propertyName in attributesMetadata) {
            if (attributesMetadata.hasOwnProperty(propertyName)) {
                var metadata = attributesMetadata[propertyName];
                if (metadata.hasDirtyAttributes) {
                    var attributeName = metadata.serializedName != null ? metadata.serializedName : propertyName;
                    dirtyData[attributeName] = metadata.serialisationValue ? metadata.serialisationValue : metadata.newValue;
                }
            }
        }
        return dirtyData;
    };
    JsonApiDatastore.prototype.saveRecord = function (attributesMetadata, model, params, headers, customUrl) {
        var _this = this;
        var modelType = model.constructor;
        var modelConfig = model.modelConfig;
        var typeName = modelConfig.type;
        var requestHeaders = this.buildHeaders(headers);
        var relationships = this.getRelationships(model);
        var url = this.buildUrl(modelType, params, model.id, customUrl);
        var httpCall;
        var body = {
            data: {
                relationships: relationships,
                type: typeName,
                id: model.id,
                attributes: this.getDirtyAttributes(attributesMetadata, model)
            }
        };
        if (model.id) {
            httpCall = this.http.patch(url, body, { headers: requestHeaders, observe: 'response' });
        }
        else {
            httpCall = this.http.post(url, body, { headers: requestHeaders, observe: 'response' });
        }
        return httpCall
            .map(function (res) { return [200, 201].indexOf(res.status) !== -1 ? _this.extractRecordData(res, modelType, model) : model; })
            .catch(function (res) {
            if (res == null) {
                return Observable_1.Observable.of(model);
            }
            return _this.handleError(res);
        })
            .map(function (res) { return _this.resetMetadataAttributes(res, attributesMetadata, modelType); })
            .map(function (res) { return _this.updateRelationships(res, relationships); });
    };
    JsonApiDatastore.prototype.deleteRecord = function (modelType, id, headers, customUrl) {
        var _this = this;
        var requestHeaders = this.buildHeaders(headers);
        var url = this.buildUrl(modelType, null, id, customUrl);
        return this.http.delete(url, { headers: requestHeaders }).catch(function (res) { return _this.handleError(res); });
    };
    JsonApiDatastore.prototype.peekRecord = function (modelType, id) {
        var type = Reflect.getMetadata('JsonApiModelConfig', modelType).type;
        return this._store[type] ? this._store[type][id] : null;
    };
    JsonApiDatastore.prototype.peekAll = function (modelType) {
        var type = Reflect.getMetadata('JsonApiModelConfig', modelType).type;
        var typeStore = this._store[type];
        return typeStore ? Object.keys(typeStore).map(function (key) { return typeStore[key]; }) : [];
    };
    Object.defineProperty(JsonApiDatastore.prototype, "headers", {
        set: function (headers) {
            this._headers = headers;
        },
        enumerable: true,
        configurable: true
    });
    JsonApiDatastore.prototype.buildUrl = function (modelType, params, id, customUrl) {
        // TODO: use HttpParams instead of appending a string to the url
        var queryParams = this.toQueryString(params);
        if (customUrl) {
            return queryParams ? customUrl + "?" + queryParams : customUrl;
        }
        var modelConfig = Reflect.getMetadata('JsonApiModelConfig', modelType);
        var baseUrl = modelConfig.baseUrl || this.datastoreConfig.baseUrl;
        var apiVersion = modelConfig.apiVersion || this.datastoreConfig.apiVersion;
        var modelEndpointUrl = modelConfig.modelEndpointUrl || modelConfig.type;
        var url = [baseUrl, apiVersion, modelEndpointUrl, id].filter(function (x) { return x; }).join('/');
        return queryParams ? url + "?" + queryParams : url;
    };
    JsonApiDatastore.prototype.getRelationships = function (data) {
        var _this = this;
        var belongsToRelationships = Reflect.getMetadata('BelongsTo', data);
        var relationships;
        var _loop_1 = function (key) {
            if (data.hasOwnProperty(key)) {
                if (data[key] instanceof json_api_model_1.JsonApiModel) {
                    relationships = relationships || {};
                    if (data[key].id) {
                        relationships[key] = {
                            data: this_1.buildSingleRelationshipData(data[key])
                        };
                    }
                }
                else if (data[key] instanceof Array && data[key].length > 0 && this_1.isValidToManyRelation(data[key])) {
                    relationships = relationships || {};
                    var relationshipData = data[key]
                        .filter(function (model) { return model.id; })
                        .map(function (model) { return _this.buildSingleRelationshipData(model); });
                    relationships[key] = {
                        data: relationshipData
                    };
                }
                else if (data[key] === null
                    && !!belongsToRelationships.find(function (element) { return element.relationship === key; })) {
                    relationships = relationships || {};
                    relationships[key] = {
                        data: null
                    };
                }
            }
        };
        var this_1 = this;
        for (var key in data) {
            _loop_1(key);
        }
        return relationships;
    };
    JsonApiDatastore.prototype.isValidToManyRelation = function (objects) {
        var isJsonApiModel = objects.every(function (item) { return item instanceof json_api_model_1.JsonApiModel; });
        var relationshipType = isJsonApiModel ? objects[0].modelConfig.type : '';
        return isJsonApiModel ? objects.every(function (item) { return item.modelConfig.type === relationshipType; }) : false;
    };
    JsonApiDatastore.prototype.buildSingleRelationshipData = function (model) {
        var relationshipType = model.modelConfig.type;
        var relationShipData = { type: relationshipType };
        if (model.id) {
            relationShipData.id = model.id;
        }
        else {
            var attributesMetadata = Reflect.getMetadata('Attribute', model);
            relationShipData.attributes = this.getDirtyAttributes(attributesMetadata, model);
        }
        return relationShipData;
    };
    JsonApiDatastore.prototype.extractQueryData = function (body, modelType, withMeta) {
        var _this = this;
        if (withMeta === void 0) { withMeta = false; }
        var models = [];
        body.data.forEach(function (data) {
            var model = _this.deserializeModel(modelType, data);
            _this.addToStore(model);
            if (body.included) {
                model.syncRelationships(data, body.included, 0);
                _this.addToStore(model);
            }
            models.push(model);
        });
        if (withMeta && withMeta === true) {
            return new json_api_query_data_1.JsonApiQueryData(models, this.parseMeta(body, modelType));
        }
        return models;
    };
    JsonApiDatastore.prototype.deserializeModel = function (modelType, data) {
        data.attributes = this.transformSerializedNamesToPropertyNames(modelType, data.attributes);
        return new modelType(this, data);
    };
    JsonApiDatastore.prototype.extractRecordData = function (res, modelType, model) {
        var body = res.body;
        // Error in Angular < 5.2.4 (see https://github.com/angular/angular/issues/20744)
        // null is converted to 'null', so this is temporary needed to make testcase possible
        // (and to avoid a decrease of the coverage)
        if (!body || body === 'null') {
            throw new Error('no body in response');
        }
        if (!body.data) {
            if (res.status === 201 || !model) {
                throw new Error('expected data in response');
            }
            return model;
        }
        if (model) {
            model.id = body.data.id;
            Object.assign(model, body.data.attributes);
        }
        var deserializedModel = model || this.deserializeModel(modelType, body.data);
        this.addToStore(deserializedModel);
        if (body.included) {
            deserializedModel.syncRelationships(body.data, body.included, 0);
            this.addToStore(deserializedModel);
        }
        return deserializedModel;
    };
    JsonApiDatastore.prototype.handleError = function (error) {
        if (error instanceof http_1.HttpErrorResponse &&
            error.error instanceof Object &&
            error.error.errors &&
            error.error.errors instanceof Array) {
            var errors = new error_response_model_1.ErrorResponse(error.error.errors);
            console.error(error, errors);
            return Observable_1.Observable.throw(errors);
        }
        console.error(error);
        return Observable_1.Observable.throw(error);
    };
    JsonApiDatastore.prototype.parseMeta = function (body, modelType) {
        var metaModel = Reflect.getMetadata('JsonApiModelConfig', modelType).meta;
        return new metaModel(body);
    };
    /** @deprecated - use buildHeaders method to build request headers **/
    JsonApiDatastore.prototype.getOptions = function (customHeaders) {
        return {
            headers: this.buildHeaders(customHeaders),
        };
    };
    JsonApiDatastore.prototype.buildHeaders = function (customHeaders) {
        var requestHeaders = {
            Accept: 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
        };
        if (this._headers) {
            this._headers.forEach(function (values, name) {
                if (name !== undefined) {
                    requestHeaders[name] = values;
                }
            });
        }
        if (customHeaders) {
            customHeaders.forEach(function (values, name) {
                if (name !== undefined) {
                    requestHeaders[name] = values;
                }
            });
        }
        return new http_1.HttpHeaders(requestHeaders);
    };
    JsonApiDatastore.prototype._toQueryString = function (params) {
        return qs.stringify(params, { arrayFormat: 'brackets' });
    };
    JsonApiDatastore.prototype.addToStore = function (modelOrModels) {
        var models = Array.isArray(modelOrModels) ? modelOrModels : [modelOrModels];
        var type = models[0].modelConfig.type;
        var typeStore = this._store[type];
        if (!typeStore) {
            typeStore = this._store[type] = {};
        }
        for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
            var model = models_1[_i];
            typeStore[model.id] = model;
        }
    };
    JsonApiDatastore.prototype.resetMetadataAttributes = function (res, attributesMetadata, modelType) {
        // TODO check why is attributesMetadata from the arguments never used
        for (var propertyName in attributesMetadata) {
            if (attributesMetadata.hasOwnProperty(propertyName)) {
                var metadata = attributesMetadata[propertyName];
                if (metadata.hasDirtyAttributes) {
                    metadata.hasDirtyAttributes = false;
                }
            }
        }
        res[symbols_1.AttributeMetadata] = attributesMetadata;
        return res;
    };
    JsonApiDatastore.prototype.updateRelationships = function (model, relationships) {
        var modelsTypes = Reflect.getMetadata('JsonApiDatastoreConfig', this.constructor).models;
        for (var relationship in relationships) {
            if (relationships.hasOwnProperty(relationship) && model.hasOwnProperty(relationship)) {
                var relationshipModel = model[relationship];
                var hasMany = Reflect.getMetadata('HasMany', relationshipModel);
                var propertyHasMany = find_1.default(hasMany, function (property) {
                    return modelsTypes[property.relationship] === model.constructor;
                });
                if (propertyHasMany) {
                    relationshipModel[propertyHasMany.propertyName] = relationshipModel[propertyHasMany.propertyName] || [];
                    var indexOfModel = relationshipModel[propertyHasMany.propertyName].indexOf(model);
                    if (indexOfModel === -1) {
                        relationshipModel[propertyHasMany.propertyName].push(model);
                    }
                    else {
                        relationshipModel[propertyHasMany.propertyName][indexOfModel] = model;
                    }
                }
            }
        }
        return model;
    };
    Object.defineProperty(JsonApiDatastore.prototype, "datastoreConfig", {
        get: function () {
            var configFromDecorator = Reflect.getMetadata('JsonApiDatastoreConfig', this.constructor);
            return Object.assign(configFromDecorator, this.config);
        },
        enumerable: true,
        configurable: true
    });
    JsonApiDatastore.prototype.transformSerializedNamesToPropertyNames = function (modelType, attributes) {
        var serializedNameToPropertyName = this.getModelPropertyNames(modelType.prototype);
        var properties = {};
        Object.keys(serializedNameToPropertyName).forEach(function (serializedName) {
            if (attributes && attributes[serializedName] !== null && attributes[serializedName] !== undefined) {
                properties[serializedNameToPropertyName[serializedName]] = attributes[serializedName];
            }
        });
        return properties;
    };
    JsonApiDatastore.prototype.getModelPropertyNames = function (model) {
        return Reflect.getMetadata('AttributeMapping', model);
    };
    JsonApiDatastore.decorators = [
        { type: core_1.Injectable },
    ];
    /** @nocollapse */
    JsonApiDatastore.ctorParameters = function () { return [
        { type: http_1.HttpClient, },
    ]; };
    return JsonApiDatastore;
}());
exports.JsonApiDatastore = JsonApiDatastore;
//# sourceMappingURL=json-api-datastore.service.js.map