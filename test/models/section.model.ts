import { JsonApiModelConfig } from '../../src/decorators/json-api-model-config.decorator';
import { JsonApiModel } from '../../src/models/json-api.model';
import { Attribute } from '../../src/decorators/attribute.decorator';
import { BelongsTo } from '../../src/decorators/belongs-to.decorator';
import { Chapter } from './chapter.model';
import { Paragraph } from './paragraph.model';

@JsonApiModelConfig({
  type: 'sections'
})
export class Section extends JsonApiModel {
  @Attribute()
  content: string;

  @BelongsTo()
  firstParagraph: Paragraph;

  @BelongsTo()
  chapter: Chapter;
}
