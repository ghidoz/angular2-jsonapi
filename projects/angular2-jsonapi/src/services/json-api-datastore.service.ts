import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import find from 'lodash-es/find';
import { catchError, map } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { JsonApiModel } from '../models/json-api.model';
import { ErrorResponse } from '../models/error-response.model';
import { JsonApiQueryData } from '../models/json-api-query-data';
import * as qs from 'qs';
import { DatastoreConfig } from '../interfaces/datastore-config.interface';
import { ModelConfig } from '../interfaces/model-config.interface';
import { AttributeMetadata } from '../constants/symbols';
import 'reflect-metadata';

export type ModelType<T extends JsonApiModel> = new(datastore: JsonApiDatastore, data: any) => T;

/**
 * HACK/FIXME:
 * Type 'symbol' cannot be used as an index type.
 * TypeScript 2.9.x
 * See https://github.com/Microsoft/TypeScript/issues/24587.
 */
// tslint:disable-next-line:variable-name
const AttributeMetadataIndex: string = AttributeMetadata as any;

@Injectable()
export class JsonApiDatastore {

  protected config: DatastoreConfig;
  private globalHeaders: HttpHeaders;
  private globalRequestOptions: object = {};
  private internalStore: { [type: string]: { [id: string]: JsonApiModel } } = {};
  private toQueryString: (params: any) => string = this.datastoreConfig.overrides
  && this.datastoreConfig.overrides.toQueryString ?
    this.datastoreConfig.overrides.toQueryString : this._toQueryString;

  constructor(protected http: HttpClient) {
  }

  set headers(headers: HttpHeaders) {
    this.globalHeaders = headers;
  }

  set requestOptions(requestOptions: object) {
    this.globalRequestOptions = requestOptions;
  }

  public get datastoreConfig(): DatastoreConfig {
    const configFromDecorator: DatastoreConfig = Reflect.getMetadata('JsonApiDatastoreConfig', this.constructor);
    return Object.assign(configFromDecorator, this.config);
  }

  private get getDirtyAttributes() {
    if (this.datastoreConfig.overrides
      && this.datastoreConfig.overrides.getDirtyAttributes) {
      return this.datastoreConfig.overrides.getDirtyAttributes;
    }
    return JsonApiDatastore.getDirtyAttributes;
  }

  private static getDirtyAttributes(attributesMetadata: any): { string: any } {
    const dirtyData: any = {};

    for (const propertyName in attributesMetadata) {
      if (attributesMetadata.hasOwnProperty(propertyName)) {
        const metadata: any = attributesMetadata[propertyName];

        if (metadata.hasDirtyAttributes) {
          const attributeName = metadata.serializedName != null ? metadata.serializedName : propertyName;
          dirtyData[attributeName] = metadata.serialisationValue ? metadata.serialisationValue : metadata.newValue;
        }
      }
    }
    return dirtyData;
  }

  /**
   * @deprecated use findAll method to take all models
   */
  query<T extends JsonApiModel>(
    modelType: ModelType<T>,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string
  ): Observable<T[]> {
    const requestHeaders: HttpHeaders = this.buildHttpHeaders(headers);
    const url: string = this.buildUrl(modelType, params, undefined, customUrl);
    return this.http.get(url, {headers: requestHeaders})
      .pipe(
        map((res: any) => this.extractQueryData(res, modelType)),
        catchError((res: any) => this.handleError(res))
      );
  }

  public findAll<T extends JsonApiModel>(
    modelType: ModelType<T>,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string
  ): Observable<JsonApiQueryData<T>> {
    const url: string = this.buildUrl(modelType, params, undefined, customUrl);
    const requestOptions: object = this.buildRequestOptions({headers, observe: 'response'});

    return this.http.get(url, requestOptions)
      .pipe(
        map((res: HttpResponse<object>) => this.extractQueryData(res, modelType, true)),
        catchError((res: any) => this.handleError(res))
      );
  }

  public findRecord<T extends JsonApiModel>(
    modelType: ModelType<T>,
    id: string,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string
  ): Observable<T> {
    const requestOptions: object = this.buildRequestOptions({headers, observe: 'response'});
    const url: string = this.buildUrl(modelType, params, id, customUrl);

    return this.http.get(url, requestOptions)
      .pipe(
        map((res: HttpResponse<object>) => this.extractRecordData(res, modelType)),
        catchError((res: any) => this.handleError(res))
      );
  }

  public createRecord<T extends JsonApiModel>(modelType: ModelType<T>, data?: any): T {
    return new modelType(this, {attributes: data});
  }

  public saveRecord<T extends JsonApiModel>(
    attributesMetadata: any,
    model: T,
    params?: any,
    headers?: HttpHeaders,
    customUrl?: string
  ): Observable<T> {
    const modelType = model.constructor as ModelType<T>;
    const modelConfig: ModelConfig = model.modelConfig;
    const typeName: string = modelConfig.type;
    const relationships: any = this.getRelationships(model);
    const url: string = this.buildUrl(modelType, params, model.id, customUrl);

    let httpCall: Observable<HttpResponse<object>>;
    const body: any = {
      data: {
        relationships,
        type: typeName,
        id: model.id,
        attributes: this.getDirtyAttributes(attributesMetadata, model)
      }
    };

    const requestOptions: object = this.buildRequestOptions({headers, observe: 'response'});

    if (model.id) {
      httpCall = this.http.patch<object>(url, body, requestOptions) as Observable<HttpResponse<object>>;
    } else {
      httpCall = this.http.post<object>(url, body, requestOptions) as Observable<HttpResponse<object>>;
    }

    return httpCall
      .pipe(
        map((res) => [200, 201].indexOf(res.status) !== -1 ? this.extractRecordData(res, modelType, model) : model),
        catchError((res) => {
          if (res == null) {
            return of(model);
          }
          return this.handleError(res);
        }),
        map((res) => this.updateRelationships(res, relationships))
      );
  }

  public deleteRecord<T extends JsonApiModel>(
    modelType: ModelType<T>,
    id: string,
    headers?: HttpHeaders,
    customUrl?: string
  ): Observable<Response> {
    const requestOptions: object = this.buildRequestOptions({headers});
    const url: string = this.buildUrl(modelType, null, id, customUrl);

    return this.http.delete(url, requestOptions)
      .pipe(
        catchError((res: HttpErrorResponse) => this.handleError(res))
      );
  }

  public peekRecord<T extends JsonApiModel>(modelType: ModelType<T>, id: string): T | null {
    const type: string = Reflect.getMetadata('JsonApiModelConfig', modelType).type;
    return this.internalStore[type] ? this.internalStore[type][id] as T : null;
  }

  public peekAll<T extends JsonApiModel>(modelType: ModelType<T>): Array<T> {
    const type = Reflect.getMetadata('JsonApiModelConfig', modelType).type;
    const typeStore = this.internalStore[type];
    return typeStore ? Object.keys(typeStore).map((key) => typeStore[key] as T) : [];
  }

  public deserializeModel<T extends JsonApiModel>(modelType: ModelType<T>, data: any) {
    data.attributes = this.transformSerializedNamesToPropertyNames(modelType, data.attributes);
    return new modelType(this, data);
  }

  public addToStore(modelOrModels: JsonApiModel | JsonApiModel[]): void {
    const models = Array.isArray(modelOrModels) ? modelOrModels : [modelOrModels];
    const type: string = models[0].modelConfig.type;
    let typeStore = this.internalStore[type];

    if (!typeStore) {
      typeStore = this.internalStore[type] = {};
    }

    for (const model of models) {
      typeStore[model.id] = model;
    }
  }

  public transformSerializedNamesToPropertyNames<T extends JsonApiModel>(modelType: ModelType<T>, attributes: any) {
    const serializedNameToPropertyName = this.getModelPropertyNames(modelType.prototype);
    const properties: any = {};

    Object.keys(serializedNameToPropertyName).forEach((serializedName) => {
      if (attributes && attributes[serializedName] !== null && attributes[serializedName] !== undefined) {
        properties[serializedNameToPropertyName[serializedName]] = attributes[serializedName];
      }
    });

    return properties;
  }

  protected buildUrl<T extends JsonApiModel>(
    modelType: ModelType<T>,
    params?: any,
    id?: string,
    customUrl?: string
  ): string {
    // TODO: use HttpParams instead of appending a string to the url
    const queryParams: string = this.toQueryString(params);

    if (customUrl) {
      return queryParams ? `${customUrl}?${queryParams}` : customUrl;
    }

    const modelConfig: ModelConfig = Reflect.getMetadata('JsonApiModelConfig', modelType);

    const baseUrl = modelConfig.baseUrl || this.datastoreConfig.baseUrl;
    const apiVersion = modelConfig.apiVersion || this.datastoreConfig.apiVersion;
    const modelEndpointUrl: string = modelConfig.modelEndpointUrl || modelConfig.type;

    const url: string = [baseUrl, apiVersion, modelEndpointUrl, id].filter((x) => x).join('/');

    return queryParams ? `${url}?${queryParams}` : url;
  }

  protected getRelationships(data: any): any {
    let relationships: any;

    const belongsToMetadata: any[] = Reflect.getMetadata('BelongsTo', data) || [];
    const hasManyMetadata: any[] = Reflect.getMetadata('HasMany', data) || [];

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (data[key] instanceof JsonApiModel) {
          relationships = relationships || {};

          if (data[key].id) {
            const entity = belongsToMetadata.find((it: any) => it.propertyName === key);
            const relationshipKey = entity.relationship;
            relationships[relationshipKey] = {
              data: this.buildSingleRelationshipData(data[key])
            };
          }
        } else if (data[key] instanceof Array) {
          const entity = hasManyMetadata.find((it: any) => it.propertyName === key);
          if (entity && this.isValidToManyRelation(data[key])) {
            relationships = relationships || {};

            const relationshipKey = entity.relationship;
            const relationshipData = data[key]
              .filter((model: JsonApiModel) => model.id)
              .map((model: JsonApiModel) => this.buildSingleRelationshipData(model));

            relationships[relationshipKey] = {
              data: relationshipData
            };
          }
        }
      }
    }

    return relationships;
  }

  protected isValidToManyRelation(objects: Array<any>): boolean {
    if (!objects.length) {
      return true;
    }
    const isJsonApiModel = objects.every((item) => item instanceof JsonApiModel);
    if (!isJsonApiModel) {
      return false;
    }
    const types = objects.map((item: JsonApiModel) => item.modelConfig.modelEndpointUrl || item.modelConfig.type);
    return types
      .filter((type: string, index: number, self: string[]) => self.indexOf(type) === index)
      .length === 1;
  }

  protected buildSingleRelationshipData(model: JsonApiModel): any {
    const relationshipType: string = model.modelConfig.type;
    const relationShipData: { type: string, id?: string, attributes?: any } = {type: relationshipType};

    if (model.id) {
      relationShipData.id = model.id;
    } else {
      const attributesMetadata: any = Reflect.getMetadata('Attribute', model);
      relationShipData.attributes = this.getDirtyAttributes(attributesMetadata, model);
    }

    return relationShipData;
  }

  protected extractQueryData<T extends JsonApiModel>(
    response: HttpResponse<object>,
    modelType: ModelType<T>,
    withMeta = false
  ): Array<T> | JsonApiQueryData<T> {
    const body: any = response.body;
    const models: T[] = [];

    body.data.forEach((data: any) => {
      const model: T = this.deserializeModel(this.datastoreConfig.models[data.type], data);
      this.addToStore(model);

      if (body.included) {
        model.syncRelationships(data, body.included.concat(data));
        this.addToStore(model);
      }

      models.push(model);
    });

    if (withMeta && withMeta === true) {
      return new JsonApiQueryData(models, this.parseMeta(body, modelType));
    }

    return models;
  }

  protected extractRecordData<T extends JsonApiModel>(
    res: HttpResponse<object>,
    modelType: ModelType<T>,
    model?: T
  ): T {
    const body: any = res.body;
    // Error in Angular < 5.2.4 (see https://github.com/angular/angular/issues/20744)
    // null is converted to 'null', so this is temporary needed to make testcase possible
    // (and to avoid a decrease of the coverage)
    if (!body || body === 'null') {
      throw new Error('no body in response');
    }

    if (!body.data) {
      if (res.status === 201 || !model) {
        throw new Error('expected data in response');
      }
      return model;
    }

    if (model) {
      model.modelInitialization = true;
      model.id = body.data.id;
      Object.assign(model, body.data.attributes);
      model.modelInitialization = false;
    }

    const deserializedModel = model || this.deserializeModel(modelType, body.data);
    this.addToStore(deserializedModel);
    if (body.included) {
      deserializedModel.syncRelationships(body.data, body.included);
      this.addToStore(deserializedModel);
    }

    return deserializedModel;
  }

  protected handleError(error: any): Observable<any> {
    if (
      error instanceof HttpErrorResponse &&
      error.error instanceof Object &&
      error.error.errors &&
      error.error.errors instanceof Array
    ) {
      const errors: ErrorResponse = new ErrorResponse(error.error.errors);
      return throwError(errors);
    }

    return throwError(error);
  }

  protected parseMeta(body: any, modelType: ModelType<JsonApiModel>): any {
    const metaModel: any = Reflect.getMetadata('JsonApiModelConfig', modelType).meta;
    return new metaModel(body);
  }

  /**
   * @deprecated use buildHttpHeaders method to build request headers
   */
  protected getOptions(customHeaders?: HttpHeaders): any {
    return {
      headers: this.buildHttpHeaders(customHeaders),
    };
  }

  protected buildHttpHeaders(customHeaders?: HttpHeaders): HttpHeaders {
    let requestHeaders: HttpHeaders = new HttpHeaders({
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json'
    });

    if (this.globalHeaders) {
      this.globalHeaders.keys().forEach((key) => {
        if (this.globalHeaders.has(key)) {
          requestHeaders = requestHeaders.set(key, this.globalHeaders.get(key));
        }
      });
    }

    if (customHeaders) {
      customHeaders.keys().forEach((key) => {
        if (customHeaders.has(key)) {
          requestHeaders = requestHeaders.set(key, customHeaders.get(key));
        }
      });
    }

    return requestHeaders;
  }

  protected resetMetadataAttributes<T extends JsonApiModel>(res: T, attributesMetadata: any, modelType: ModelType<T>) {
    for (const propertyName in attributesMetadata) {
      if (attributesMetadata.hasOwnProperty(propertyName)) {
        const metadata: any = attributesMetadata[propertyName];

        if (metadata.hasDirtyAttributes) {
          metadata.hasDirtyAttributes = false;
        }
      }
    }

    // @ts-ignore
    res[AttributeMetadataIndex] = attributesMetadata;
    return res;
  }

  protected updateRelationships<T extends JsonApiModel>(model: T, relationships: any): T {
    const modelsTypes: any = Reflect.getMetadata('JsonApiDatastoreConfig', this.constructor).models;

    for (const relationship in relationships) {
      if (relationships.hasOwnProperty(relationship) && model.hasOwnProperty(relationship)) {
        const relationshipModel: JsonApiModel = model[relationship];
        const hasMany: any[] = Reflect.getMetadata('HasMany', relationshipModel);
        const propertyHasMany: any = find(hasMany, (property) => {
          return modelsTypes[property.relationship] === model.constructor;
        });

        if (propertyHasMany) {
          relationshipModel[propertyHasMany.propertyName] = relationshipModel[propertyHasMany.propertyName] || [];

          const indexOfModel = relationshipModel[propertyHasMany.propertyName].indexOf(model);

          if (indexOfModel === -1) {
            relationshipModel[propertyHasMany.propertyName].push(model);
          } else {
            relationshipModel[propertyHasMany.propertyName][indexOfModel] = model;
          }
        }
      }
    }

    return model;
  }

  protected getModelPropertyNames(model: JsonApiModel) {
    return Reflect.getMetadata('AttributeMapping', model) || [];
  }

  private buildRequestOptions(customOptions: any = {}): object {
    const httpHeaders: HttpHeaders = this.buildHttpHeaders(customOptions.headers);

    const requestOptions: object = Object.assign(customOptions, {
      headers: httpHeaders
    });

    return Object.assign(this.globalRequestOptions, requestOptions);
  }

  private _toQueryString(params: any): string {
    return qs.stringify(params, {arrayFormat: 'brackets'});
  }
}
