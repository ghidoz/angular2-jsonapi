import * as _ from 'underscore';
import 'reflect-metadata';
import { Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { JsonApiDatastore, ModelType } from '../services/json-api-datastore.service';

export class JsonApiModel {

    id: string;
    [key: string]: any;

    constructor(private _datastore: JsonApiDatastore, data: any) {
        if (data) {
            this.id = data.id;
            _.extend(this, data.attributes);
        }
    }

    syncRelationships(data: any, included: any, level: number) {
        if (data) {
            this.parseHasMany(data, included, level);
            this.parseBelongsTo(data, included, level);
        }
    }

    save(params?: any, headers?: Headers): Observable<JsonApiModel> {
        let attributesMetadata = Reflect.getMetadata('Attribute', this);
        return this._datastore.saveRecord(attributesMetadata, this, params, headers);
    }

    private parseHasMany(data: any, included: any, level: number) {
        let hasMany = Reflect.getMetadata('HasMany', this);
        if (hasMany) {
            for (let metadata of hasMany){
                if (data.relationships[metadata.relationship] && data.relationships[metadata.relationship].data) {
                    let typeName: string = data.relationships[metadata.relationship].data[0].type;
                    let modelType = Reflect.getMetadata('JsonApiDatastoreConfig', this._datastore.constructor).models[typeName];
                    this[metadata.propertyName] = this.getHasManyRelationship(modelType, data, included, metadata.relationship, typeName, level);
                }
            }
        }
    }

    private parseBelongsTo(data: any, included: any, level: number) {
        let belongsTo = Reflect.getMetadata('BelongsTo', this);
        if (belongsTo) {
            for (let metadata of belongsTo){
                if (data.relationships[metadata.relationship] && data.relationships[metadata.relationship].data) {
                    let typeName: string = data.relationships[metadata.relationship].data.type;
                    let modelType = Reflect.getMetadata('JsonApiDatastoreConfig', this._datastore.constructor).models[typeName];
                    this[metadata.propertyName] = this.getBelongsToRelationship(modelType, data, included, metadata.relationship, typeName, level);
                }
            }
        }
    }

    private getHasManyRelationship(modelType: ModelType, data: any, included: any, relationship: string, typeName: string, level: number): JsonApiModel[] {
        let relationshipList: JsonApiModel[] = [];
        data.relationships[relationship].data.forEach((item: any) => {
            let relationshipData: any = _.findWhere(included, {id: item.id, type: typeName});
            let newObject = new modelType(this._datastore, relationshipData);
            if (level <= 1) {
              newObject.syncRelationships(relationshipData, included, ++level);
            }
            relationshipList.push(newObject);
        });
        return relationshipList;
    }


    private getBelongsToRelationship(modelType: ModelType, data: any, included: any, relationship: string, typeName: string, level: number): JsonApiModel {
        let id = data.relationships[relationship].data.id;
        let relationshipData: any = _.findWhere(included, {id: id, type: typeName});
        let newObject = new modelType(this._datastore, relationshipData);
        if (level <= 1) {
            newObject.syncRelationships(relationshipData, included, ++level);
        }
        return newObject;
    }

}
