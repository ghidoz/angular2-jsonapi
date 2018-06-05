import { JsonApiModelConfig } from '../../src/decorators/json-api-model-config.decorator';
import { JsonApiModel } from '../../src/models/json-api.model';
import { Attribute } from '../../src/decorators/attribute.decorator';
import { BelongsTo } from '../../src/decorators/belongs-to.decorator';
import { Chapter } from './chapter.model';

@JsonApiModelConfig({
  type: 'paragraphs'
})
export class Paragraph extends JsonApiModel {
  @Attribute()
  content: string;

  @BelongsTo()
  section: Section;
}
