import { Thing } from './thing';
import { HasMany } from '../../src/decorators/has-many.decorator';
import { JsonApiModel } from '../../src/models/json-api.model';
import { JsonApiModelConfig } from '../../src/decorators/json-api-model-config.decorator';

@JsonApiModelConfig({
  type: 'thing_category'
})
export class ThingCategory extends JsonApiModel {
  @HasMany()
  members: Thing[];
}
