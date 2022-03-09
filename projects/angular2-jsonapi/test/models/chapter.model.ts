/* tslint:disable:variable-name */
import { Book } from './book.model';
import { JsonApiModelConfig } from '../../src/decorators/json-api-model-config.decorator';
import { JsonApiModel } from '../../src/models/json-api.model';
import { Attribute } from '../../src/decorators/attribute.decorator';
import { BelongsTo } from '../../src/decorators/belongs-to.decorator';
import { HasMany } from '../../src/decorators/has-many.decorator';
import { Section } from './section.model';

@JsonApiModelConfig({
  type: 'chapters'
})
export class Chapter extends JsonApiModel {

  @Attribute()
  title: string;

  @Attribute()
  ordering: number;

  @Attribute()
  created_at: Date;

  @Attribute()
  updated_at: Date;

  @BelongsTo()
  book: Book;

  @BelongsTo()
  firstSection: Section;

  @HasMany()
  related: Chapter[];

  @BelongsTo()
  relatesTo: Chapter;
}
