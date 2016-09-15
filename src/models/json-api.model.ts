import * as _ from 'underscore';
import 'reflect-metadata';
import { JsonApiDatastore } from '../services/json-api-datastore.service';

export class JsonApiModel {

    id: string;
    [key: string]: any;

    constructor(data: any) {
        if (data) {
            this.id = data.id;
            _.extend(this, data.attributes);
        }
    }

    syncRelationships(data: any, included: any, level: number, datastore: JsonApiDatastore) {
        if (data) {
            this.parseHasMany(data, included, level, datastore);
            this.parseBelongsTo(data, included, level, datastore);
        }
    }

    private parseHasMany(data: any, included: any, level: number, datastore: JsonApiDatastore) {
        let hasMany = Reflect.getMetadata('HasMany', this);
        if (hasMany) {
            for (let metadata of hasMany){
                if (data.relationships[metadata.relationship] && data.relationships[metadata.relationship].data) {
                    let typeName: string = data.relationships[metadata.relationship].data[0].type;
                    let objectType = Reflect.getMetadata('JsonApiDatastoreConfig', datastore.constructor).models[typeName];
                    this[metadata.propertyName] = this.getHasManyRelationship(objectType, data, included, metadata.relationship, typeName, level, datastore);
                }
            }
        }
    }

    private parseBelongsTo(data: any, included: any, level: number, datastore: JsonApiDatastore) {
        let belongsTo = Reflect.getMetadata('BelongsTo', this);
        if (belongsTo) {
            for (let metadata of belongsTo){
                if (data.relationships[metadata.relationship] && data.relationships[metadata.relationship].data) {
                    let typeName: string = data.relationships[metadata.relationship].data.type;
                    let objectType = Reflect.getMetadata('JsonApiDatastoreConfig', datastore.constructor).models[typeName];
                    this[metadata.propertyName] = this.getBelongsToRelationship(objectType, data, included, metadata.relationship, typeName, level, datastore);
                }
            }
        }
    }

    private getHasManyRelationship(objectType: { new(data: any): JsonApiModel; }, data: any, included: any, relationship: string, typeName: string, level: number, datastore: JsonApiDatastore): JsonApiModel[] {
        let relationshipList: JsonApiModel[] = [];
        data.relationships[relationship].data.forEach((item: any) => {
            let relationshipData: any = _.findWhere(included, {id: item.id, type: typeName});
            let newObject = new objectType(relationshipData);
            if (level <= 1) {
              newObject.syncRelationships(relationshipData, included, ++level, datastore);
            }
            relationshipList.push(newObject);

        });
        return relationshipList;
    }

    private getBelongsToRelationship(objectType: { new(data: any): JsonApiModel; }, data: any, included: any, relationship: string, typeName: string, level: number, datastore: JsonApiDatastore): JsonApiModel {
        let id = data.relationships[relationship].data.id;
        let relationshipData: any = _.findWhere(included, {id: id, type: typeName});
        let newObject = new objectType(relationshipData);
        if (level <= 1) {
            newObject.syncRelationships(relationshipData, included, ++level, datastore);
        }
        return newObject;

    }

}
