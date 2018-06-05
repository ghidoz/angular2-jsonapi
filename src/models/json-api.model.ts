import find from 'lodash-es/find';
import includes from 'lodash-es/includes';
import { Observable } from 'rxjs/Observable';
import { JsonApiDatastore, ModelType } from '../services/json-api-datastore.service';
import { ModelConfig } from '../interfaces/model-config.interface';
import * as _ from 'lodash';
import { AttributeMetadata } from '../constants/symbols';

export class JsonApiModel {
  id: string;
  [key: string]: any;

  // tslint:disable-next-line:variable-name
  constructor(private _datastore: JsonApiDatastore, data?: any) {
    if (data) {
      this.id = data.id;
      Object.assign(this, data.attributes);
    }
  }

  syncRelationships(data: any, included: any, remainingModels?: Array<any>): void {
    if (data) {
      let modelsForProcessing = remainingModels;

      if (!modelsForProcessing) {
        modelsForProcessing = [].concat(included);
      }

      this.parseHasMany(data, included, modelsForProcessing);
      this.parseBelongsTo(data, included, modelsForProcessing);
    }
  }

  save(params?: any, headers?: Headers): Observable<this> {
    const attributesMetadata: any = this[AttributeMetadata];
    return this._datastore.saveRecord(attributesMetadata, this, params, headers);
  }

  get hasDirtyAttributes() {
    const attributesMetadata: any = this[AttributeMetadata];
    let hasDirtyAttributes = false;
    for (const propertyName in attributesMetadata) {
      if (attributesMetadata.hasOwnProperty(propertyName)) {
        const metadata: any = attributesMetadata[propertyName];

        if (metadata.hasDirtyAttributes) {
          hasDirtyAttributes = true;
          break;
        }
      }
    }
    return hasDirtyAttributes;
  }

  rollbackAttributes(): void {
    const attributesMetadata: any = this[AttributeMetadata];
    let metadata: any;
    for (const propertyName in attributesMetadata) {
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

    this[AttributeMetadata] = attributesMetadata;
  }

  get modelConfig(): ModelConfig {
    return Reflect.getMetadata('JsonApiModelConfig', this.constructor);
  }


  private parseHasMany(data: any, included: any, remainingModels: Array<any>): void {
    const hasMany: any = Reflect.getMetadata('HasMany', this);

    if (hasMany) {
      for (const metadata of hasMany) {
        const relationship: any = data.relationships ? data.relationships[metadata.relationship] : null;

        if (relationship && relationship.data && relationship.data.length > 0) {
          let allModels: JsonApiModel[] = [];
          const modelTypesFetched: any = [];

          for (const typeIndex of Object.keys(relationship.data)) {
            const typeName: string = relationship.data[typeIndex].type;

            if (!includes(modelTypesFetched, typeName)) {
              modelTypesFetched.push(typeName);
              // tslint:disable-next-line:max-line-length
              const modelType: ModelType<this> = Reflect.getMetadata('JsonApiDatastoreConfig', this._datastore.constructor).models[typeName];

              if (modelType) {
                // tslint:disable-next-line:max-line-length
                const relationshipModels: JsonApiModel[] = this.getHasManyRelationship(modelType, relationship.data, included, typeName, remainingModels);
                if (relationshipModels.length > 0) {
                  allModels = allModels.concat(relationshipModels);
                }
              } else {
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
  }

  private parseBelongsTo(data: any, included: Array<any>, remainingModels: Array<any>): void {
    const belongsTo: any = Reflect.getMetadata('BelongsTo', this);

    if (belongsTo) {
      for (const metadata of belongsTo) {
        const relationship: any = data.relationships ? data.relationships[metadata.relationship] : null;
        if (relationship && relationship.data) {
          const dataRelationship: any = (relationship.data instanceof Array) ? relationship.data[0] : relationship.data;
          if (dataRelationship) {
            const typeName: string = dataRelationship.type;
            // tslint:disable-next-line:max-line-length
            const modelType: ModelType<this> = Reflect.getMetadata('JsonApiDatastoreConfig', this._datastore.constructor).models[typeName];

            if (modelType) {
              const relationshipModel = this.getBelongsToRelationship(
                modelType,
                dataRelationship,
                included,
                typeName,
                remainingModels
              );

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

  private getHasManyRelationship<T extends JsonApiModel>(
    modelType: ModelType<T>,
    data: any,
    included: any,
    typeName: string,
    remainingModels: Array<any>
  ): Array<T> {
    const relationshipList: Array<T> = [];

    data.forEach((item: any) => {
      const relationshipData: any = remainingModels.find((x) => x.id === item.id && x.type === typeName);

      if (relationshipData) {
        const newObject: T = this.createOrPeek(modelType, relationshipData);

        const indexOfNewlyFoundModel = remainingModels.indexOf(relationshipData);
        remainingModels.splice(indexOfNewlyFoundModel, 1);

        newObject.syncRelationships(relationshipData, included, remainingModels);

        relationshipList.push(newObject);
      }
    });
    return relationshipList;
  }


  private getBelongsToRelationship<T extends JsonApiModel>(
    modelType: ModelType<T>,
    data: any,
    included: Array<any>,
    typeName: string,
    remainingModels: Array<any>
  ): T | null {
    const id: string = data.id;

    const relationshipData: any = remainingModels.find((x) => x.id === id && x.type === typeName);

    if (relationshipData) {
      const newObject: T = this.createOrPeek(modelType, relationshipData);

      const indexOfNewlyFoundModel = remainingModels.indexOf(relationshipData);
      remainingModels.splice(indexOfNewlyFoundModel, 1);

      newObject.syncRelationships(relationshipData, included, remainingModels);

      return newObject;
    }

    return this._datastore.peekRecord(modelType, id);
  }

  private createOrPeek<T extends JsonApiModel>(modelType: ModelType<T>, data: any): T {
    const peek = this._datastore.peekRecord(modelType, data.id);

    if (peek) {
      _.extend(peek, data.attributes);
      return peek;
    }

    const newObject: T = new modelType(this._datastore, data);
    this._datastore.addToStore(newObject);

    return newObject;
  }
}
