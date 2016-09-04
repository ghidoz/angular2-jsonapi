import * as _ from 'underscore';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { JsonApiModel } from '../models/json-api.model';

export type ModelType = { new(datastore: JsonApiDatastore, data: any): JsonApiModel; };

@Injectable()
export class JsonApiDatastore {

    private _headers: Headers;
    private _store: any = {};

    constructor(private http: Http) { }

    query(modelType: ModelType, params?: any, headers?: Headers): Observable<JsonApiModel[]> {
        let options = this.getOptions(headers);
        let url = this.buildUrl(modelType, params);
        return this.http.get(url, options)
            .map((res: any) => this.extractQueryData(res, modelType))
            .catch((res: any) => this.handleError(res));
    }

    findRecord(modelType: ModelType, id: string, params?: any, headers?: Headers): Observable<JsonApiModel> {
        let options = this.getOptions(headers);
        let url = this.buildUrl(modelType, params, id);
        return this.http.get(url, options)
            .map((res: any) => this.extractRecordData(res, modelType))
            .catch((res: any) => this.handleError(res));
    }

    createRecord(modelType: ModelType, data?: any): JsonApiModel {
        return new modelType(this, { attributes: data });
    }

    saveRecord(data?: any, params?: any, headers?: Headers): Observable<JsonApiModel> {
        let modelType = data.constructor;
        let typeName =  Reflect.getMetadata('JsonApiModelConfig', modelType).type;
        let options = this.getOptions(headers);
        let relationships = this.getRelationships(data);
        let url = this.buildUrl(modelType, params);
        data = _.clone(data);
        delete data._datastore;
        let httpCall: Observable<Response>;
        let body: any = {
            data: {
                type: typeName,
                id: data.id,
                attributes: data,
                relationships: relationships
            }
        };
        if (data.id) {
            httpCall = this.http.patch(url + `/${data.id}`, body, options);
        } else {
            httpCall = this.http.post(url, body, options);
        }
        return httpCall
            .map((res: any) => this.extractRecordData(res, modelType))
            .catch((res: any) => this.handleError(res));
    }

    peekRecord(modelType: ModelType, id: string) {
        let type = Reflect.getMetadata('JsonApiModelConfig', modelType).type;
        return this._store[type][id];
    }

    peekAll(modelType: ModelType) {
        let type = Reflect.getMetadata('JsonApiModelConfig', modelType).type;
        return _.values(this._store[type]);
    }

    set headers(headers: Headers){
        this._headers = headers;
    }

    private buildUrl(modelType: ModelType, params?: any, id?: string) {
        let typeName =  Reflect.getMetadata('JsonApiModelConfig', modelType).type;
        let baseUrl = Reflect.getMetadata('JsonApiDatastoreConfig', this.constructor).baseUrl;
        let idToken = id ? `/${id}` : null;
        return [baseUrl, typeName, idToken, (params ? '?' : ''), this.toQueryString(params)].join('');
    }

    private getRelationships(data: any): any{
        let relationships: any;
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                if (data[key] instanceof JsonApiModel) {
                    relationships = relationships || {};
                    let relationshipType =  Reflect.getMetadata('JsonApiModelConfig', data[key].constructor).type;
                    relationships[key] = {
                        data: {
                            type: relationshipType,
                            id: data[key].id
                        }
                    };
                    delete data[key];
                }
            }
        }
        return relationships;
    }

    private extractQueryData(res: any, modelType: ModelType): JsonApiModel[] {
        let body = res.json();
        let models: JsonApiModel[] = [];
        body.data.forEach((data: any) => {
            let model: JsonApiModel = new modelType(this, data);
            if (body.included) {
                model.syncRelationships(data, body.included);
            }
            models.push(model);
        });
        this.addToStore(models);
        return models;
    }

    private extractRecordData(res: any, modelType: ModelType): JsonApiModel {
        let body = res.json();
        let model: JsonApiModel = new modelType(this, body.data);
        if (body.included) {
            model.syncRelationships(body.data, body.included);
        }
        this.addToStore(model);
        return model;
    }

    private handleError(error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg);
        return Observable.throw(errMsg);
    }

    private getOptions(customHeaders?: Headers) {
        let headers: Headers = this._headers ? this._headers : new Headers();
        headers.append('Accept', 'application/vnd.api+json');
        headers.append('Content-Type', 'application/vnd.api+json');
        if (customHeaders) {
            customHeaders.forEach(function(values, name){
                headers.append(name, values[0]);
            });
        }
        return new RequestOptions({ headers: headers });
    }

    private toQueryString(params: any) {
        let encodedStr = '';
        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                if (encodedStr && encodedStr[encodedStr.length - 1] !== '&') {
                    encodedStr = encodedStr + '&';
                }
                let value = params[key];
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

    private addToStore(models: JsonApiModel | JsonApiModel[]) {
        let model = models instanceof Array ? models[0] : models;
        let type = Reflect.getMetadata('JsonApiModelConfig', model.constructor).type;
        if (!this._store[type]) {
            this._store[type] = {};
        }
        let hash = this.fromArrayToHash(models);
        _.extend(this._store[type], hash);
    }

    private fromArrayToHash(models: JsonApiModel | JsonApiModel[]) {
        let modelsArray: JsonApiModel[] = models instanceof Array ? models : [models];
        return _.indexBy(modelsArray, 'id');
    }

}
