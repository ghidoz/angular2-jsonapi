import find from 'lodash-es/find';
import includes from 'lodash-es/includes';
import { Observable } from 'rxjs';
import { JsonApiDatastore, ModelType } from '../services/json-api-datastore.service';
import { ModelConfig } from '../interfaces/model-config.interface';
import * as _ from 'lodash';
import { AttributeMetadata } from '../constants/symbols';
import { HttpHeaders } from '@angular/common/http';

/**
 * HACK/FIXME:
 * Type 'symbol' cannot be used as an index type.
 * TypeScript 2.9.x
 * See https://github.com/Microsoft/TypeScript/issues/24587.
 */
// tslint:disable-next-line:variable-name
const AttributeMetadataIndex: string = AttributeMetadata as any;

export class JsonApiModel {
  id: string;
  public modelInitialization: boolean = false;

  [key: string]: any;

  lastSyncModels: Array<any>;

  constructor(private internalDatastore: JsonApiDatastore, data?: any) {
    if (data) {
      this.modelInitialization = true;
      this.id = data.id;
      Object.assign(this, data.attributes);
      this.modelInitialization = false;
    }
  }

  public isModelInitialization(): boolean {
    return this.modelInitialization;
  }

  public syncRelationships(data: any, included: any, remainingModels?: Array<any>): void {
    if (this.lastSyncModels === included) {
      return;
    }

    if (data) {
      let modelsForProcessing = remainingModels;

      if (modelsForProcessing === undefined) {
        modelsForProcessing = [].concat(included);
      }

      this.parseHasMany(data, included, modelsForProcessing);
      this.parseBelongsTo(data, included, modelsForProcessing);
    }

    this.lastSyncModels = included;
  }

  public save(params?: any, headers?: HttpHeaders, customUrl?: string): Observable<this> {
    this.checkChanges();
    const attributesMetadata: any = this[AttributeMetadataIndex];
    return this.internalDatastore.saveRecord(attributesMetadata, this, params, headers, customUrl);
  }

  get hasDirtyAttributes() {
    this.checkChanges();
    const attributesMetadata: any = this[AttributeMetadataIndex];
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

  private checkChanges() {
    const attributesMetadata: any = this[AttributeMetadata];
    for (const propertyName in attributesMetadata) {
      if (attributesMetadata.hasOwnProperty(propertyName)) {
        const metadata: any = attributesMetadata[propertyName];
        if (metadata.nested) {
          this[AttributeMetadata][propertyName].hasDirtyAttributes = !_.isEqual(
            attributesMetadata[propertyName].oldValue,
            attributesMetadata[propertyName].newValue
          );
          this[AttributeMetadata][propertyName].serialisationValue = attributesMetadata[propertyName].converter(
            Reflect.getMetadata('design:type', this, propertyName),
            _.cloneDeep(attributesMetadata[propertyName].newValue),
            true
          );
        }
      }
    }
  }

  public rollbackAttributes(): void {
    const attributesMetadata: any = this[AttributeMetadataIndex];
    for (const propertyName in attributesMetadata) {
      if (attributesMetadata.hasOwnProperty(propertyName)) {
        if (attributesMetadata[propertyName].hasDirtyAttributes) {
          this[propertyName] = _.cloneDeep(attributesMetadata[propertyName].oldValue);
        }
      }
    }
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
              const modelType: ModelType<this> = Reflect.getMetadata('JsonApiDatastoreConfig', this.internalDatastore.constructor).models[typeName];

              if (modelType) {
                const relationshipModels: JsonApiModel[] = this.getHasManyRelationship(
                  modelType,
                  relationship.data,
                  included,
                  typeName,
                  remainingModels
                );

                if (relationshipModels.length > 0) {
                  allModels = allModels.concat(relationshipModels);
                }
              } else {
                throw { message: `parseHasMany - Model type for relationship ${typeName} not found.` };
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
            const modelType: ModelType<this> = Reflect.getMetadata('JsonApiDatastoreConfig', this.internalDatastore.constructor).models[typeName];

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
              throw { message: `parseBelongsTo - Model type for relationship ${typeName} not found.` };
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
      const relationshipData: any = find(included, { id: item.id, type: typeName } as any);

      if (relationshipData) {
        const newObject: T = this.createOrPeek(modelType, relationshipData);

        const indexOfNewlyFoundModel = remainingModels.indexOf(relationshipData);
        const modelsForProcessing = remainingModels.concat([]);

        if (indexOfNewlyFoundModel !== -1) {
          modelsForProcessing.splice(indexOfNewlyFoundModel, 1);
          newObject.syncRelationships(relationshipData, included, modelsForProcessing);
        }

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

    const relationshipData: any = find(included, { id, type: typeName } as any);

    if (relationshipData) {
      const newObject: T = this.createOrPeek(modelType, relationshipData);

      const indexOfNewlyFoundModel = remainingModels.indexOf(relationshipData);
      const modelsForProcessing = remainingModels.concat([]);

      if (indexOfNewlyFoundModel !== -1) {
        modelsForProcessing.splice(indexOfNewlyFoundModel, 1);
        newObject.syncRelationships(relationshipData, included, modelsForProcessing);
      }

      return newObject;
    }

    return this.internalDatastore.peekRecord(modelType, id);
  }

  private createOrPeek<T extends JsonApiModel>(modelType: ModelType<T>, data: any): T {
    const peek = this.internalDatastore.peekRecord(modelType, data.id);

    if (peek) {
      _.extend(peek, this.internalDatastore.transformSerializedNamesToPropertyNames(modelType, data.attributes));
      return peek;
    }

    const newObject: T = this.internalDatastore.deserializeModel(modelType, data);
    this.internalDatastore.addToStore(newObject);

    return newObject;
  }
}
