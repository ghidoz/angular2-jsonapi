import { Injectable, ReflectiveInjector } from '@angular/core';
import { Headers, Http, RequestOptions, HTTP_PROVIDERS } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { JsonApiModel } from '../models/json-api.model';

@Injectable()
export class JsonApiDatastore {

    private http: Http;
    private _headers: Headers;

    constructor() {
        let injector = ReflectiveInjector.resolveAndCreate([HTTP_PROVIDERS]);
        this.http = injector.get(Http);
    }

    query(type: { new(data: any): JsonApiModel; }, params?: any, headers?: Headers): Observable<JsonApiModel[]> {
        let options = this.getOptions(headers);
        let url = this.buildUrl(type, params);
        return this.http.get(url, options)
            .map((res: any) => this.extractQueryData(res, type))
            .catch((res: any) => this.handleError(res));
    }

    findRecord(type: { new(data: any): JsonApiModel; }, id: string, params?: any, headers?: Headers): Observable<JsonApiModel> {
        let options = this.getOptions(headers);
        let url = this.buildUrl(type, params, id);
        return this.http.get(url, options)
            .map((res: any) => this.extractRecordData(res, type))
            .catch((res: any) => this.handleError(res));
    }

    createRecord(type: { new(data: any): JsonApiModel; }, data?: any, params?: any, headers?: Headers) {
        let typeName =  Reflect.getMetadata('JsonApiModelConfig', type).type;
        let options = this.getOptions(headers);
        let relationships = this.getRelationships(data);
        let url = this.buildUrl(type, params);
        return this.http.post(url, {
            data: {
                type: typeName,
                attributes: data,
                relationships: relationships
            }
        }, options)
            .map((res: any) => this.extractRecordData(res, type))
            .catch((res: any) => this.handleError(res))
    }

    set headers(headers: Headers){
        this._headers = headers;
    }

    private buildUrl(type: { new(data: any): JsonApiModel; }, params?: any, id?: string) {
        let typeName =  Reflect.getMetadata('JsonApiModelConfig', type).type;
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

    private extractQueryData(res: any, type: { new(data: any): JsonApiModel; }): JsonApiModel[] {
        let body = res.json();
        let models: JsonApiModel[] = [];
        body.data.forEach((data: any) => {
            let model: JsonApiModel = new type(data);
            if (body.included) {
                model.syncRelationships(data, body.included, this);
            }
            models.push(model);
        });
        return models;
    }

    private extractRecordData(res: any, type: { new(data: any): JsonApiModel; }): JsonApiModel {
        let body = res.json();
        let model: JsonApiModel = new type(body.data);
        if (body.included) {
            model.syncRelationships(body.data, body.included, this);
        }
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

}
