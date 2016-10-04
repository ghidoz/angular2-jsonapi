import * as _ from 'underscore';
import 'reflect-metadata';
import { Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { JsonApiDatastore, ModelType } from '../services/json-api-datastore.service';

export class JsonApiModel {

  id: string;
  [key: string]: any;

  constructor(private _datastore: JsonApiDatastore, data?: any) {
    if (data) {
      this.id = data.id;
      _.extend(this, data.attributes);
    }
  }

  syncRelationships(data: any, included: any, level: number): void {
    if (data) {
      this.parseHasMany(data, included, level);
      this.parseBelongsTo(data, included, level);
    }
  }

  save(params?: any, headers?: Headers): Observable<JsonApiModel> {
    let attributesMetadata: any = Reflect.getMetadata('Attribute', this);
    return this._datastore.saveRecord(attributesMetadata, this, params, headers);
  }

  get hasDirtyAttributes() {
    let attributesMetadata: any = Reflect.getMetadata('Attribute', this);
    let hasDirtyAttributes: boolean = false;
    for (let propertyName in attributesMetadata) {
      if (attributesMetadata.hasOwnProperty(propertyName)) {
        let metadata: any = attributesMetadata[propertyName];
        if (metadata.hasDirtyAttributes) {
          hasDirtyAttributes = true;
          break;
        }
      }
    }
    return hasDirtyAttributes;
  }

  rollbackAttributes(): void {
    let attributesMetadata: any = Reflect.getMetadata('Attribute', this);
    let metadata: any;
    for (let propertyName in attributesMetadata) {
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
    Reflect.defineMetadata('Attribute', attributesMetadata, this);
  }

  private parseHasMany(data: any, included: any, level: number): void {
    let hasMany: any = Reflect.getMetadata('HasMany', this);
    if (hasMany) {
      for (let metadata of hasMany) {
        let relationship: any = data.relationships[metadata.relationship];
        if (relationship && relationship.data && relationship.data.length > 0) {
          let typeName: string = relationship.data[0].type;
          let modelType: ModelType = Reflect.getMetadata('JsonApiDatastoreConfig', this._datastore.constructor).models[typeName];
          let relationshipModel: JsonApiModel[] = this.getHasManyRelationship(modelType, relationship.data, included, typeName, level);
          if (relationshipModel.length > 0) {
            this[metadata.propertyName] = relationshipModel;
          }
        }
      }
    }
  }

  private parseBelongsTo(data: any, included: any, level: number): void {
    let belongsTo: any = Reflect.getMetadata('BelongsTo', this);
    if (belongsTo) {
      for (let metadata of belongsTo) {
        let relationship: any = data.relationships[metadata.relationship];
        if (relationship && relationship.data) {
          let dataRelationship: any = (relationship.data instanceof Array) ? relationship.data[0] : relationship.data;
          if (dataRelationship) {
            let typeName: string = dataRelationship.type;
            let modelType: ModelType = Reflect.getMetadata('JsonApiDatastoreConfig', this._datastore.constructor).models[typeName];
            let relationshipModel: JsonApiModel = this.getBelongsToRelationship(modelType, dataRelationship, included, typeName, level);
            if (relationshipModel) {
              this[metadata.propertyName] = relationshipModel;
            }
          }
        }
      }
    }
  }

  private getHasManyRelationship(modelType: ModelType, data: any, included: any, typeName: string, level: number): JsonApiModel[] {
    let relationshipList: JsonApiModel[] = [];
    data.forEach((item: any) => {
      let relationshipData: any = _.findWhere(included, {id: item.id, type: typeName});
      if (relationshipData) {
        let newObject: JsonApiModel = this.createOrPeek(modelType, relationshipData);
        if (level <= 1) {
          newObject.syncRelationships(relationshipData, included, level + 1);
        }
        relationshipList.push(newObject);
      }
    });
    return relationshipList;
  }


  private getBelongsToRelationship(modelType: ModelType, data: any, included: any, typeName: string, level: number): JsonApiModel {
    let id: string = data.id;
    let relationshipData: any = _.findWhere(included, {id: id, type: typeName});
    if (relationshipData) {
      let newObject: JsonApiModel = this.createOrPeek(modelType, relationshipData);
      if (level <= 1) {
        newObject.syncRelationships(relationshipData, included, level + 1);
      }
      return newObject;
    }
    return this._datastore.peekRecord(modelType, id);
  }

  private createOrPeek(modelType: ModelType, data: any): JsonApiModel {
    let peek = this._datastore.peekRecord(modelType, data.id);
    if (peek) {
      return peek;
    }
    let newObject: JsonApiModel = new modelType(this._datastore, data);
    this._datastore.addToStore(newObject);
    return newObject;
  }

}
