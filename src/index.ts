import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { PROVIDERS } from './services';

export * from './decorators/has-many.decorator';
export * from './decorators/belongs-to.decorator';
export * from './decorators/json-api-model-config.decorator';
export * from './decorators/json-api-datastore-config.decorator';

export * from './models/json-api.model';

export * from './services';

@NgModule({
  providers: [ PROVIDERS ],
  exports: [ HttpModule ]
})
export class JsonApiModule { }
