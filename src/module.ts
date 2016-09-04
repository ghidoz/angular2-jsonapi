import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { PROVIDERS } from './providers';

@NgModule({
  providers: [ PROVIDERS ],
  exports: [ HttpModule ]
})
export class JsonApiModule { }
