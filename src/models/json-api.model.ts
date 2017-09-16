import { Headers } from '@angular/http';
import find from 'lodash-es/find';
import { Observable } from 'rxjs/Observable';
import { JsonApiDatastore, ModelType } from '../services/json-api-datastore.service';
import { ModelConfig } from '../interfaces/model-config.interface';

export class JsonApiModel {
  id: string;
  [key: string]: any;

  constructor(private _datastore: JsonApiDatastore, data?: any) {
    if (data) {
      this.id = data.id;
      Object.assign(this, data.attributes);
    }
  }

  syncRelationships(data: any, included: any, level: number): void {
    if (data) {
      this.parseHasMany(data, included, level);
      this.parseBelongsTo(data, included, level);
    }
  }

  save(params?: any, headers?: Headers): Observable<this> {
    let attributesMetadata: any = Reflect.getMetadata('Attribute', this);
    return this._datastore.saveRecord(attributesMetadata, this, params, headers);
  }

  get hasDirtyAttributes() {
    let attributesMetadata: any = Reflect.getMetadata('Attribute', this);
    let hasDirtyAttributes = false;
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

  get modelConfig(): ModelConfig {
    return Reflect.getMetadata('JsonApiModelConfig', this.constructor);
  }

  private parseHasMany(data: any, included: any, level: number): void {
    let hasMany: any = Reflect.getMetadata('HasMany', this);
    if (hasMany) {
      for (let metadata of hasMany) {
        let relationship: any = data.relationships ? data.relationships[metadata.relationship] : null;
        if (relationship && relationship.data && relationship.data.length > 0) {
          let typeName: string = relationship.data[0].type;
          let modelType: ModelType<this> = Reflect.getMetadata('JsonApiDatastoreConfig', this._datastore.constructor).models[typeName];
          if (modelType) {
            let relationshipModel: JsonApiModel[] = this.getHasManyRelationship(modelType, relationship.data, included, typeName, level);
            if (relationshipModel.length > 0) {
              this[metadata.propertyName] = relationshipModel;
            }
          } else {
            throw {message: 'parseHasMany - Model type for relationship ' + typeName + ' not found.'};
          }
        }
      }
    }
  }

  private parseBelongsTo(data: any, included: any, level: number): void {
    let belongsTo: any = Reflect.getMetadata('BelongsTo', this);
    if (belongsTo) {
      for (let metadata of belongsTo) {
        let relationship: any = data.relationships ? data.relationships[metadata.relationship] : null;
        if (relationship && relationship.data) {
          let dataRelationship: any = (relationship.data instanceof Array) ? relationship.data[0] : relationship.data;
          if (dataRelationship) {
            let typeName: string = dataRelationship.type;
            let modelType: ModelType<this> = Reflect.getMetadata('JsonApiDatastoreConfig', this._datastore.constructor).models[typeName];
            if (modelType) {
              let relationshipModel: JsonApiModel = this.getBelongsToRelationship(modelType, dataRelationship, included, typeName, level);
              if (relationshipModel) {
                this[metadata.propertyName] = relationshipModel;
              }
            } else {
              throw { message: 'parseBelongsTo - Model type for relationship ' + typeName + ' not found.' };
            }
          }
        }
      }
    }
  }

  private getHasManyRelationship<T extends JsonApiModel>(modelType: ModelType<T>, data: any, included: any, typeName: string, level: number): T[] {
    let relationshipList: T[] = [];
    data.forEach((item: any) => {
      let relationshipData: any = find(included, {id: item.id, type: typeName});
      if (relationshipData) {
        let newObject: T = this.createOrPeek(modelType, relationshipData);
        if (level <= 1) {
          newObject.syncRelationships(relationshipData, included, level + 1);
        }
        relationshipList.push(newObject);
      }
    });
    return relationshipList;
  }


  private getBelongsToRelationship<T extends JsonApiModel>(modelType: ModelType<T>, data: any, included: any, typeName: string, level: number): T {
    let id: string = data.id;
    let relationshipData: any = find(included, {id: id, type: typeName});
    if (relationshipData) {
      let newObject: T = this.createOrPeek(modelType, relationshipData);
      if (level <= 1) {
        newObject.syncRelationships(relationshipData, included, level + 1);
      }
      return newObject;
    }
    return this._datastore.peekRecord(modelType, id);
  }

  private createOrPeek<T extends JsonApiModel>(modelType: ModelType<T>, data: any): T {
    let peek = this._datastore.peekRecord(modelType, data.id);
    if (peek) {
      return peek;
    }
    let newObject: T = new modelType(this._datastore, data);
    this._datastore.addToStore(newObject);
    return newObject;
  }
}
