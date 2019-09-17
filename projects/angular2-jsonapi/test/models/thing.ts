import { ThingCategory } from './thingCategory';
import { JsonApiModelConfig } from '../../src/decorators/json-api-model-config.decorator';
import { JsonApiModel } from '../../src/models/json-api.model';
import { Attribute } from '../../src/decorators/attribute.decorator';
import { HasMany } from '../../src/decorators/has-many.decorator';

@JsonApiModelConfig({
  type: 'thing'
})
export class Thing extends JsonApiModel {
  @Attribute()
  name: string;

  @HasMany()
  categories: ThingCategory[];
}
