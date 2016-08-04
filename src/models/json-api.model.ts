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
        let hasMany = Reflect.getMetadata('HasMany', this);
        for (let metadata of hasMany){
            if (data.relationships[metadata.key]) {
                let type = Reflect.getMetadata('JsonApiDatastoreConfig', datastore.constructor).models[metadata.key];
                this[metadata.attribute] = this.getRelationship(type, data, included, metadata.key);
            }
        }
    }

    private getRelationship(type: { new(data: any): JsonApiModel; }, data: any, included: any, relationshipName: string): JsonApiModel[] {
        let relationshipList: JsonApiModel[] = [];
        data.relationships[relationshipName].data.forEach((item: any) => {
            let relationship: any = _.findWhere(included, {id: item.id});
            relationshipList.push(new type(relationship));
        });
        return relationshipList;
    }

}
