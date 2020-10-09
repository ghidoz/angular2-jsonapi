import { Attribute } from '../../src/decorators/attribute.decorator';
import { JsonApiModelConfig } from '../../src/decorators/json-api-model-config.decorator';
import { Book } from './book.model';

@JsonApiModelConfig({
  type: 'crimeBooks',
  modelEndpointUrl: 'books'
})
export class CrimeBook extends Book {

  @Attribute()
  ageLimit: number;
}
