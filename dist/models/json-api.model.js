"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var find_1 = require("lodash-es/find");
var includes_1 = require("lodash-es/includes");
var _ = require("lodash");
var symbols_1 = require("../constants/symbols");
var JsonApiModel = /** @class */ (function () {
    // tslint:disable-next-line:variable-name
    function JsonApiModel(_datastore, data) {
        this._datastore = _datastore;
        if (data) {
            this.id = data.id;
            Object.assign(this, data.attributes);
        }
    }
    JsonApiModel.prototype.syncRelationships = function (data, included, level) {
        if (data) {
            this.parseHasMany(data, included, level);
            this.parseBelongsTo(data, included, level);
        }
    };
    JsonApiModel.prototype.save = function (params, headers) {
        var attributesMetadata = this[symbols_1.AttributeMetadata];
        return this._datastore.saveRecord(attributesMetadata, this, params, headers);
    };
    Object.defineProperty(JsonApiModel.prototype, "hasDirtyAttributes", {
        get: function () {
            var attributesMetadata = this[symbols_1.AttributeMetadata];
            var hasDirtyAttributes = false;
            for (var propertyName in attributesMetadata) {
                if (attributesMetadata.hasOwnProperty(propertyName)) {
                    var metadata = attributesMetadata[propertyName];
                    if (metadata.hasDirtyAttributes) {
                        hasDirtyAttributes = true;
                        break;
                    }
                }
            }
            return hasDirtyAttributes;
        },
        enumerable: true,
        configurable: true
    });
    JsonApiModel.prototype.rollbackAttributes = function () {
        var attributesMetadata = this[symbols_1.AttributeMetadata];
        var metadata;
        for (var propertyName in attributesMetadata) {
            if (attributesMetadata.hasOwnProperty(propertyName)) {
                if (attributesMetadata[propertyName].hasDirtyAttributes) {
                    this[propertyName] = attributesMetadata[propertyName].oldValue;
                    metadata = {
                        hasDirtyAttributes: false,
                        newValue: attributesMetadata[propertyName].oldValue,
                        oldValue: undefined
                    };
                    attributesMetadata[propertyName] = metadata;
                }
            }
        }
        this[symbols_1.AttributeMetadata] = attributesMetadata;
    };
    Object.defineProperty(JsonApiModel.prototype, "modelConfig", {
        get: function () {
            return Reflect.getMetadata('JsonApiModelConfig', this.constructor);
        },
        enumerable: true,
        configurable: true
    });
    JsonApiModel.prototype.parseHasMany = function (data, included, level) {
        var hasMany = Reflect.getMetadata('HasMany', this);
        if (hasMany) {
            for (var _i = 0, hasMany_1 = hasMany; _i < hasMany_1.length; _i++) {
                var metadata = hasMany_1[_i];
                var relationship = data.relationships ? data.relationships[metadata.relationship] : null;
                if (relationship && relationship.data && relationship.data.length > 0) {
                    var allModels = [];
                    var modelTypesFetched = [];
                    for (var _a = 0, _b = Object.keys(relationship.data); _a < _b.length; _a++) {
                        var typeIndex = _b[_a];
                        var typeName = relationship.data[typeIndex].type;
                        if (!includes_1.default(modelTypesFetched, typeName)) {
                            modelTypesFetched.push(typeName);
                            // tslint:disable-next-line:max-line-length
                            var modelType = Reflect.getMetadata('JsonApiDatastoreConfig', this._datastore.constructor).models[typeName];
                            if (modelType) {
                                // tslint:disable-next-line:max-line-length
                                var relationshipModels = this.getHasManyRelationship(modelType, relationship.data, included, typeName, level);
                                if (relationshipModels.length > 0) {
                                    allModels = allModels.concat(relationshipModels);
                                }
                            }
                            else {
                                throw { message: 'parseHasMany - Model type for relationship ' + typeName + ' not found.' };
                            }
                        }
                        if (allModels.length > 0) {
                            this[metadata.propertyName] = allModels;
                        }
                    }
                }
            }
        }
    };
    JsonApiModel.prototype.parseBelongsTo = function (data, included, level) {
        var belongsTo = Reflect.getMetadata('BelongsTo', this);
        if (belongsTo) {
            for (var _i = 0, belongsTo_1 = belongsTo; _i < belongsTo_1.length; _i++) {
                var metadata = belongsTo_1[_i];
                var relationship = data.relationships ? data.relationships[metadata.relationship] : null;
                if (relationship && relationship.data) {
                    var dataRelationship = (relationship.data instanceof Array) ? relationship.data[0] : relationship.data;
                    if (dataRelationship) {
                        var typeName = dataRelationship.type;
                        // tslint:disable-next-line:max-line-length
                        var modelType = Reflect.getMetadata('JsonApiDatastoreConfig', this._datastore.constructor).models[typeName];
                        if (modelType) {
                            var relationshipModel = this.getBelongsToRelationship(modelType, dataRelationship, included, typeName, level);
                            if (relationshipModel) {
                                this[metadata.propertyName] = relationshipModel;
                            }
                        }
                        else {
                            throw { message: 'parseBelongsTo - Model type for relationship ' + typeName + ' not found.' };
                        }
                    }
                }
            }
        }
    };
    JsonApiModel.prototype.getHasManyRelationship = function (modelType, data, included, typeName, level) {
        var _this = this;
        var relationshipList = [];
        data.forEach(function (item) {
            var relationshipData = find_1.default(included, { id: item.id, type: typeName });
            if (relationshipData) {
                var newObject = _this.createOrPeek(modelType, relationshipData);
                if (level <= 2) {
                    newObject.syncRelationships(relationshipData, included, level + 1);
                }
                relationshipList.push(newObject);
            }
        });
        return relationshipList;
    };
    JsonApiModel.prototype.getBelongsToRelationship = function (modelType, data, included, typeName, level) {
        var id = data.id;
        var relationshipData = find_1.default(included, { id: id, type: typeName });
        if (relationshipData) {
            var newObject = this.createOrPeek(modelType, relationshipData);
            if (level <= 2) {
                newObject.syncRelationships(relationshipData, included, level + 1);
            }
            return newObject;
        }
        return this._datastore.peekRecord(modelType, id);
    };
    JsonApiModel.prototype.createOrPeek = function (modelType, data) {
        var peek = this._datastore.peekRecord(modelType, data.id);
        if (peek) {
            _.extend(peek, data.attributes);
            return peek;
        }
        var newObject = new modelType(this._datastore, data);
        this._datastore.addToStore(newObject);
        return newObject;
    };
    return JsonApiModel;
}());
exports.JsonApiModel = JsonApiModel;
//# sourceMappingURL=json-api.model.js.map