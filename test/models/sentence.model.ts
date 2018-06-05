import { JsonApiModelConfig } from '../../src/decorators/json-api-model-config.decorator';
import { JsonApiModel } from '../../src/models/json-api.model';
import { Attribute } from '../../src/decorators/attribute.decorator';
import { BelongsTo } from '../../src/decorators/belongs-to.decorator';
import { Paragraph } from './paragraph.model';

@JsonApiModelConfig({
  type: 'sentences'
})
export class Sentence extends JsonApiModel {
  @Attribute()
  content: string;

  @BelongsTo()
  paragraph: Paragraph;
}
