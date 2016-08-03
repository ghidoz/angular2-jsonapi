import { Injectable, ReflectiveInjector } from '@angular/core';
import { Headers, Http, RequestOptions, HTTP_PROVIDERS } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class JsonApiDatastore {

    protected url: string;
    private http: Http;

    constructor() {
        let injector = ReflectiveInjector.resolveAndCreate([HTTP_PROVIDERS]);
        this.http = injector.get(Http);
    }

    query<Model>(type: { new(data: any, included: any): Model; }, params?: any): Observable<Model[]> {
        let typeName =  Reflect.getMetadata('JsonApiModelConfig', type).type;
        let options = this.getOptions();
        return this.http.get([this.url, typeName, '?', this.toQueryString(params)].join(''), options)
            .map((res: any) => this.extractQueryData<Model>(res, type))
            .catch((res: any) => this.handleError(res));
    }

    private extractQueryData<Model>(res: any, type: { new(data: any, included: any): Model; }): Model[] {
        let body = res.json();
        let models: Model[] = [];
        body.data.forEach((data: any) => {
            models.push(new type(data, body.included));
        });
        return models;
    }

    private handleError(error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg);
        return Observable.throw(errMsg);
    }

    private getOptions() {
        let headers = new Headers({ 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' });
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
