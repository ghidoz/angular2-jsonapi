import * as _ from 'underscore';
import 'reflect-metadata';

export class JsonApiModel {

    id: number;
    [key: string]: any;

    constructor(data: any, included?: any) {
        this.id = +data.id;
        _.extend(this, data.attributes);
        if (included) {
            this.getRelationshipsMetadata(data, included);
        }
    }

    private getRelationshipsMetadata(data: any, included: any) {
        let hasMany = Reflect.getMetadata('HasMany', this);
        for (let metadata of hasMany){
            if (data.relationships[metadata.name]) {
                this[metadata.attribute] = this.getRelationship(metadata.type, data, included, metadata.name);
            }
        }
    }

    getRelationship(type: { new(...args: any[]): symbol; }, data: any, included: any, relationshipName: string): symbol[] {
        let relationshipList: symbol[] = [];
        data.relationships[relationshipName].data.forEach((item: any) => {
            let relationship: any = _.findWhere(included, {id: item.id});
            relationshipList.push(new type(relationship));
        });
        return relationshipList;
    }

}
