import * as _ from 'underscore';
import 'reflect-metadata';
import { JsonApiDatastore } from '../services/json-api-datastore.service';

export class JsonApiModel {

    id: string;
    [key: string]: any;

    constructor(data: any) {
        this.id = data.id;
        _.extend(this, data.attributes);
    }

    syncRelationships(data: any, included: any, datastore: JsonApiDatastore) {
        this.parseHasMany(data, included, datastore);
        this.parseBelongsTo(data, included, datastore);
    }

    private parseHasMany(data: any, included: any, datastore: JsonApiDatastore) {
        let hasMany = Reflect.getMetadata('HasMany', this);
        if (hasMany) {
            for (let metadata of hasMany){
                if (data.relationships[metadata.relationship] && data.relationships[metadata.relationship].data) {
                    let typeName: string = data.relationships[metadata.relationship].data[0].type;
                    let objectType = Reflect.getMetadata('JsonApiDatastoreConfig', datastore.constructor).models[typeName];
                    this[metadata.propertyName] = this.getHasManyRelationship(objectType, data, included, metadata.relationship, typeName);
                }
            }
        }
    }

    private parseBelongsTo(data: any, included: any, datastore: JsonApiDatastore) {
        let belongsTo = Reflect.getMetadata('BelongsTo', this);
        if (belongsTo) {
            for (let metadata of belongsTo){
                if (data.relationships[metadata.relationship] && data.relationships[metadata.relationship].data) {
                    let typeName: string = data.relationships[metadata.relationship].data.type;
                    let objectType = Reflect.getMetadata('JsonApiDatastoreConfig', datastore.constructor).models[typeName];
                    this[metadata.propertyName] = this.getBelongsToRelationship(objectType, data, included, metadata.relationship, typeName);
                }
            }
        }
    }

    private getHasManyRelationship(objectType: { new(data: any): JsonApiModel; }, data: any, included: any, relationship: string, typeName: string): JsonApiModel[] {
        let relationshipList: JsonApiModel[] = [];
        data.relationships[relationship].data.forEach((item: any) => {
            let relationshipData: any = _.findWhere(included, {id: item.id, type: typeName});
            relationshipList.push(new objectType(relationshipData));
        });
        return relationshipList;
    }

    private getBelongsToRelationship(objectType: { new(data: any): JsonApiModel; }, data: any, included: any, relationship: string, typeName: string): JsonApiModel {
        let id = data.relationships[relationship].data.id;
        let relationshipData: any = _.findWhere(included, {id: id, type: typeName});
        return new objectType(relationshipData);
    }

}
