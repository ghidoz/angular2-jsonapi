import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { JsonApiModel } from '../models/json-api.model';
import {ErrorResponse} from '../models/error-response.model';

export type ModelType<T extends JsonApiModel> = { new(datastore: JsonApiDatastore, data: any): T; };

@Injectable()
export class JsonApiDatastore {

  private _headers: Headers;
  private _store: any = {};

  constructor(private http: Http) {
  }

  query<T extends JsonApiModel>(modelType: ModelType<T>, params?: any, headers?: Headers): Observable<T[]> {
    let options: RequestOptions = this.getOptions(headers);
    let url: string = this.buildUrl(modelType, params);
    return this.http.get(url, options)
        .map((res: any) => this.extractQueryData(res, modelType))
        .catch((res: any) => this.handleError(res));
  }

  findRecord<T extends JsonApiModel>(modelType: ModelType<T>, id: string, params?: any, headers?: Headers): Observable<T> {
    let options: RequestOptions = this.getOptions(headers);
    let url: string = this.buildUrl(modelType, params, id);
    return this.http.get(url, options)
        .map((res: any) => this.extractRecordData(res, modelType))
        .catch((res: any) => this.handleError(res));
  }

  createRecord<T extends JsonApiModel>(modelType: ModelType<T>, data?: any): T {
    return new modelType(this, {attributes: data});
  }

  saveRecord<T extends JsonApiModel>(attributesMetadata: any, model?: T, params?: any, headers?: Headers): Observable<T> {
    let modelType = <ModelType<T>>model.constructor;
    let typeName: string = Reflect.getMetadata('JsonApiModelConfig', modelType).type;
    let options: RequestOptions = this.getOptions(headers);
    let relationships: any = !model.id ? this.getRelationships(model) : undefined;
    let url: string = this.buildUrl(modelType, params, model.id);
    let dirtyData: any = {};
    for (let propertyName in attributesMetadata) {
      if (attributesMetadata.hasOwnProperty(propertyName)) {
        let metadata: any = attributesMetadata[propertyName];
        if (metadata.hasDirtyAttributes) {
          dirtyData[propertyName] = metadata.serialisationValue ? metadata.serialisationValue : metadata.newValue;
        }
      }
    }
    let httpCall: Observable<Response>;
    let body: any = {
      data: {
        type: typeName,
        id: model.id,
        attributes: dirtyData,
        relationships: relationships
      }
    };
    if (model.id) {
      httpCall = this.http.patch(url, body, options);
    } else {
      httpCall = this.http.post(url, body, options);
    }
    return httpCall
        .map((res: any) => this.extractRecordData(res, modelType, model))
        .map((res: any) => this.resetMetadataAttributes(res, attributesMetadata, modelType))
        .map((res: any) => this.updateRelationships(res, relationships))
        .catch((res: any) => this.handleError(res));
  }

  deleteRecord<T extends JsonApiModel>(modelType: ModelType<T>, id: string, headers?: Headers): Observable<Response> {
    let options: RequestOptions = this.getOptions(headers);
    let url: string = this.buildUrl(modelType, null, id);
    return this.http.delete(url, options)
        .catch((res: any) => this.handleError(res));
  }

  peekRecord<T extends JsonApiModel>(modelType: ModelType<T>, id: string): T {
    let type: string = Reflect.getMetadata('JsonApiModelConfig', modelType).type;
    return this._store[type] ? this._store[type][id] : null;
  }

  peekAll<T extends JsonApiModel>(modelType: ModelType<T>): T[] {
    let type = Reflect.getMetadata('JsonApiModelConfig', modelType).type;
    return _.values(<JsonApiModel>this._store[type]);
  }

  set headers(headers: Headers) {
    this._headers = headers;
  }

  private buildUrl<T extends JsonApiModel>(modelType: ModelType<T>, params?: any, id?: string): string {
    let typeName: string = Reflect.getMetadata('JsonApiModelConfig', modelType).type;
    let baseUrl: string = Reflect.getMetadata('JsonApiDatastoreConfig', this.constructor).baseUrl;
    let idToken: string = id ? `/${id}` : null;
    return [baseUrl, typeName, idToken, (params ? '?' : ''), this.toQueryString(params)].join('');
  }

  private getRelationships(data: any): any {
    let relationships: any;
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        if (data[key] instanceof JsonApiModel) {
          relationships = relationships || {};
          let relationshipType: string = Reflect.getMetadata('JsonApiModelConfig', data[key].constructor).type;
          relationships[key] = {
            data: {
              type: relationshipType,
              id: data[key].id
            }
          };
        }
      }
    }
    return relationships;
  }

  private extractQueryData<T extends JsonApiModel>(res: any, modelType: ModelType<T>): T[] {
    let body: any = res.json();
    let models: T[] = [];
    body.data.forEach((data: any) => {
      let model: T = new modelType(this, data);
      this.addToStore(model);
      if (body.included) {
        model.syncRelationships(data, body.included, 0);
        this.addToStore(model);
      }
      models.push(model);
    });
    return models;
  }

  private extractRecordData<T extends JsonApiModel>(res: any, modelType: ModelType<T>, model?: T): T {
    let body: any = res.json();
    if (model) {
      model.id = body.data.id;
      _.extend(model, body.data.attributes);
    }
    model = model || new modelType(this, body.data);
    this.addToStore(model);
    if (body.included) {
      model.syncRelationships(body.data, body.included, 0);
      this.addToStore(model);
    }
    return model;
  }

  protected handleError(error: any): ErrorObservable<any> {
    let errMsg: string = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    try {
      let body: any = error.json();
      if (body.errors && body.errors instanceof Array) {
        let errors: ErrorResponse = new ErrorResponse(body.errors);
        console.error(errMsg, errors);
        return Observable.throw(errors);
      }
    } catch (e) {
      // no valid JSON
    }

    console.error(errMsg);
    return Observable.throw(errMsg);
  }

  private getOptions(customHeaders?: Headers): RequestOptions {
    let requestHeaders = new Headers();
    requestHeaders.set('Accept', 'application/vnd.api+json');
    requestHeaders.set('Content-Type', 'application/vnd.api+json');
    if (this._headers) {
      this._headers.forEach((values, name) => {
        requestHeaders.set(name, values);
      });
    }

    if (customHeaders) {
      customHeaders.forEach((values, name) => {
        requestHeaders.set(name, values);
      });
    }
    return new RequestOptions({headers: requestHeaders});
  }

  private toQueryString(params: any) {
    let encodedStr = '';
    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        if (encodedStr && encodedStr[encodedStr.length - 1] !== '&') {
          encodedStr = encodedStr + '&';
        }
        let value: any = params[key];
        if (value instanceof Array) {
          for (let i = 0; i < value.length; i++) {
            encodedStr = encodedStr + key + '=' + encodeURIComponent(value[i]) + '&';
          }
        } else if (typeof value === 'object') {
          for (let innerKey in value) {
            if (value.hasOwnProperty(innerKey)) {
              encodedStr = encodedStr + key + '[' + innerKey + ']=' + encodeURIComponent(value[innerKey]) + '&';
            }
          }
        } else {
          encodedStr = encodedStr + key + '=' + encodeURIComponent(value);
        }
      }
    }
    if (encodedStr[encodedStr.length - 1] === '&') {
      encodedStr = encodedStr.substr(0, encodedStr.length - 1);
    }
    return encodedStr;
  }

  public addToStore(models: JsonApiModel | JsonApiModel[]): void {
    let model: JsonApiModel = models instanceof Array ? models[0] : models;
    let type: string = Reflect.getMetadata('JsonApiModelConfig', model.constructor).type;
    if (!this._store[type]) {
      this._store[type] = {};
    }
    let hash: any = this.fromArrayToHash(models);
    _.extend(this._store[type], hash);
  }

  private fromArrayToHash(models: JsonApiModel | JsonApiModel[]): any {
    let modelsArray: JsonApiModel[] = models instanceof Array ? models : [models];
    return _.keyBy(modelsArray, 'id');
  }

  private resetMetadataAttributes<T extends JsonApiModel>(res: any, attributesMetadata: any, modelType: ModelType<T>) {
    attributesMetadata = Reflect.getMetadata('Attribute', res);
    for (let propertyName in attributesMetadata) {
      if (attributesMetadata.hasOwnProperty(propertyName)) {
        let metadata: any = attributesMetadata[propertyName];
        if (metadata.hasDirtyAttributes) {
          metadata.hasDirtyAttributes = false;
        }
      }
    }
    Reflect.defineMetadata('Attribute', attributesMetadata, res);
    return res;
  }

  private updateRelationships(model: JsonApiModel, relationships: any): JsonApiModel {
    let modelsTypes: any = Reflect.getMetadata('JsonApiDatastoreConfig', this.constructor).models;
    for (let relationship in relationships) {
      if (relationships.hasOwnProperty(relationship) && model.hasOwnProperty(relationship)) {
        let relationshipModel: JsonApiModel = model[relationship];
        let hasMany: any[] = Reflect.getMetadata('HasMany', relationshipModel);
        let propertyHasMany: any = _.find(hasMany, (property) => {
          return modelsTypes[property.relationship] === model.constructor;
        });
        if (propertyHasMany) {
          relationshipModel[propertyHasMany.propertyName].push(model);
        }
      }
    }
    return model;
  };

}
