import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions, Response} from '@angular/http';
import find from 'lodash-es/find';
import {Observable} from 'rxjs/Observable';
import {ErrorObservable} from 'rxjs/observable/ErrorObservable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import {JsonApiModel} from '../models/json-api.model';
import {ErrorResponse} from '../models/error-response.model';
import {JsonApiQueryData} from '../models/json-api-query-data';
import * as qs from 'qs';
import {DatastoreConfig} from '../interfaces/datastore-config.interface';
import {ModelConfig} from '../interfaces/model-config.interface';

export type ModelType<T extends JsonApiModel> = { new(datastore: JsonApiDatastore, data: any): T; };

@Injectable()
export class JsonApiDatastore {
    private _headers: Headers;
    private _store: {[type: string]: {[id: string]: JsonApiModel}} = {};

    protected config: DatastoreConfig;

    constructor(private http: Http) {}

    /** @deprecated - use findAll method to take all models **/
    query<T extends JsonApiModel>(modelType: ModelType<T>, params?: any, headers?: Headers, customUrl?: string): Observable<T[]> {
        let options: RequestOptions = this.getOptions(headers);
        let url: string = this.buildUrl(modelType, params, null, customUrl);
        return this.http.get(url, options)
            .map((res: any) => this.extractQueryData(res, modelType))
            .catch((res: any) => this.handleError(res));
    }

    findAll<T extends JsonApiModel>(modelType: ModelType<T>, params?: any, headers?: Headers, customUrl?: string): Observable<JsonApiQueryData<T>> {
        let options: RequestOptions = this.getOptions(headers);
        let url: string = this.buildUrl(modelType, params, null, customUrl);
        return this.http.get(url, options)
            .map((res: any) => this.extractQueryData(res, modelType, true))
            .catch((res: any) => this.handleError(res));
    }

    findRecord<T extends JsonApiModel>(modelType: ModelType<T>, id: string, params?: any, headers?: Headers, customUrl?: string): Observable<T> {
        let options: RequestOptions = this.getOptions(headers);
        let url: string = this.buildUrl(modelType, params, id, customUrl);
        return this.http.get(url, options)
            .map((res: any) => this.extractRecordData(res, modelType))
            .catch((res: any) => this.handleError(res));
    }

    createRecord<T extends JsonApiModel>(modelType: ModelType<T>, data?: any): T {
        return new modelType(this, {attributes: data});
    }

    private getDirtyAttributes(attributesMetadata: any): { string: any} {
        let dirtyData: any = {};
        for (let propertyName in attributesMetadata) {
            if (attributesMetadata.hasOwnProperty(propertyName)) {
                let metadata: any = attributesMetadata[propertyName];
                if (metadata.hasDirtyAttributes) {
                    dirtyData[propertyName] = metadata.serialisationValue ? metadata.serialisationValue : metadata.newValue;
                }
            }
        }
        return dirtyData;
    }

    saveRecord<T extends JsonApiModel>(attributesMetadata: any, model?: T, params?: any, headers?: Headers, customUrl?: string): Observable<T> {
        let modelType = <ModelType<T>>model.constructor;
        const modelConfig: ModelConfig = model.modelConfig;
        let typeName: string = modelConfig.type;
        let options: RequestOptions = this.getOptions(headers);
        let relationships: any = this.getRelationships(model);
        let url: string = this.buildUrl(modelType, params, model.id, customUrl);

        let httpCall: Observable<Response>;
        let body: any = {
            data: {
                type: typeName,
                id: model.id,
                attributes: this.getDirtyAttributes(attributesMetadata),
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
            .map((res: any) => res ? this.resetMetadataAttributes(res, attributesMetadata, modelType) : res)
            .map((res: any) => res ? this.updateRelationships(res, relationships)  : res)
            .catch((res: any) => this.handleError(res));
    }

    deleteRecord<T extends JsonApiModel>(modelType: ModelType<T>, id: string, headers?: Headers, customUrl?: string): Observable<Response> {
        let options: RequestOptions = this.getOptions(headers);
        let url: string = this.buildUrl(modelType, null, id, customUrl);
        return this.http.delete(url, options)
            .catch((res: any) => this.handleError(res));
    }

    peekRecord<T extends JsonApiModel>(modelType: ModelType<T>, id: string): T {
        let type: string = Reflect.getMetadata('JsonApiModelConfig', modelType).type;
        return this._store[type] ? <T>this._store[type][id] : null;
    }

    peekAll<T extends JsonApiModel>(modelType: ModelType<T>): T[] {
        let type = Reflect.getMetadata('JsonApiModelConfig', modelType).type;
        let typeStore = this._store[type];
        return typeStore ? Object.keys(typeStore).map(key => <T>typeStore[key]) : [];
    }

    set headers(headers: Headers) {
        this._headers = headers;
    }

    private buildUrl<T extends JsonApiModel>(modelType: ModelType<T>, params?: any, id?: string, customUrl?: string): string {
        const queryParams: string = this.toQueryString(params);

        if (customUrl) {
            return queryParams ? `${customUrl}?${queryParams}` : customUrl;
        }

        const modelConfig: ModelConfig = Reflect.getMetadata('JsonApiModelConfig', modelType);

        const baseUrl: string = modelConfig.baseUrl || this.datastoreConfig.baseUrl;
        const apiVersion: string = modelConfig.apiVersion || this.datastoreConfig.apiVersion;
        const modelEndpointUrl: string = modelConfig.modelEndpointUrl || modelConfig.type;

        const url: string = [baseUrl, apiVersion, modelEndpointUrl, id].filter(x => x).join('/');

        return queryParams ? `${url}?${queryParams}` : url;
    }

    private getRelationships(data: any): any {
        let relationships: any;
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                if (data[key] instanceof JsonApiModel) {
                    relationships = relationships || {};
                    relationships[key] = {
                        data: this.buildSingleRelationshipData(data[key])
                    };
                } else if (data[key] instanceof Array && data[key].length > 0 && this.isValidToManyRelation(data[key])) {
                    relationships = relationships || {};
                    relationships[key] = {
                        data: data[key].map((model: JsonApiModel) => this.buildSingleRelationshipData(model))
                    };
                }
            }
        }
        return relationships;
    }

    private isValidToManyRelation(objects: Array<any>): boolean {
        let isJsonApiModel = objects.every(item => item instanceof JsonApiModel);
        let relationshipType: string = isJsonApiModel ? objects[0].modelConfig.type : '';
        return isJsonApiModel ? objects.every((item: JsonApiModel) => item.modelConfig.type === relationshipType) : false;
    }

    private buildSingleRelationshipData(model: JsonApiModel): any {
        let relationshipType: string = model.modelConfig.type;
        let relationShipData: { type: string, id?: string, attributes?: any } = {type: relationshipType};
        if (model.id) {
            relationShipData.id = model.id;
        } else {
            let attributesMetadata: any = Reflect.getMetadata('Attribute', model);
            relationShipData.attributes = this.getDirtyAttributes(attributesMetadata);
        }
        return relationShipData;
    }

    private extractQueryData<T extends JsonApiModel>(res: any, modelType: ModelType<T>, withMeta = false): T[] | JsonApiQueryData<T> {
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

        if (withMeta && withMeta === true) {
            return new JsonApiQueryData(models, this.parseMeta(body, modelType));
        } else {
            return models;
        }
    }

    private extractRecordData<T extends JsonApiModel>(res: any, modelType: ModelType<T>, model?: T): T {
        let body: any = res.json();
        if (!body) {
            return null;
        }
        if (model) {
            model.id = body.data.id;
            Object.assign(model, body.data.attributes);
        }
        model = model || new modelType(this, body.data);
        this.addToStore(model);
        if (body.included) {
            model.syncRelationships(body.data, body.included, 0);
            this.addToStore(model);
        }
        return model;
    }

    protected handleError(error: any): ErrorObservable {
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

    protected parseMeta(body: any, modelType: ModelType<JsonApiModel>): any {
        let metaModel: any = Reflect.getMetadata('JsonApiModelConfig', modelType).meta;
        let jsonApiMeta = new metaModel();

        for (let key in body) {
            if (jsonApiMeta.hasOwnProperty(key)) {
                jsonApiMeta[key] = body[key];
            }
        }
        return jsonApiMeta;
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
        return qs.stringify(params, { arrayFormat: 'brackets' });
    }

    public addToStore(modelOrModels: JsonApiModel | JsonApiModel[]): void {
        let models = Array.isArray(modelOrModels) ? modelOrModels : [modelOrModels];
        let type: string = models[0].modelConfig.type;
        let typeStore = this._store[type];
        if (!typeStore) {
            typeStore = this._store[type] = {};
        }
        for (let model of models) {
            typeStore[model.id] = model;
        }
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
                let propertyHasMany: any = find(hasMany, (property) => {
                    return modelsTypes[property.relationship] === model.constructor;
                });
                if (propertyHasMany) {
                  if (relationshipModel[propertyHasMany.propertyName] !== undefined) {
                    relationshipModel[propertyHasMany.propertyName].push(model);
                  }
                }
            }
        }
        return model;
    };

    private get datastoreConfig(): DatastoreConfig {
        const configFromDecorator: DatastoreConfig = Reflect.getMetadata('JsonApiDatastoreConfig', this.constructor);
        return Object.assign(configFromDecorator, this.config);
    }
}
