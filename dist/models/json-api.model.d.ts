import { Observable } from 'rxjs/Observable';
import { JsonApiDatastore } from '../services/json-api-datastore.service';
import { ModelConfig } from '../interfaces/model-config.interface';
export declare class JsonApiModel {
    private _datastore;
    protected data: any;
    id: string;
    [key: string]: any;
    constructor(_datastore: JsonApiDatastore, data?: any);
    readonly meta: any;
    readonly relationships: any;
    syncRelationships(data: any, included: any, level: number): void;
    save(params?: any, headers?: Headers): Observable<this>;
    readonly hasDirtyAttributes: boolean;
    rollbackAttributes(): void;
    readonly modelConfig: ModelConfig;
    private parseHasMany(data, included, level);
    private parseBelongsTo(data, included, level);
    private getHasManyRelationship<T>(modelType, data, included, typeName, level);
    private getBelongsToRelationship<T>(modelType, data, included, typeName, level);
    private createOrPeek<T>(modelType, data);
}
