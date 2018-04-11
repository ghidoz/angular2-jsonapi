import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { PROVIDERS } from './providers';

@NgModule({
  providers: [PROVIDERS],
  exports: [HttpClientModule]
})
export class JsonApiModule {
}
