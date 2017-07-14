import { Company } from './company.model';
import { Chapter } from "./chapter.model";
import { Author } from "./author.model";
import { JsonApiModelConfig } from "../../src/decorators/json-api-model-config.decorator";
import { JsonApiModel } from "../../src/models/json-api.model";
import { Attribute } from "../../src/decorators/attribute.decorator";
import { HasMany } from "../../src/decorators/has-many.decorator";
import { HasOne } from "../../src/decorators/has-one.decorator";
import { BelongsTo } from "../../src/decorators/belongs-to.decorator";

@JsonApiModelConfig({
  type: "books"
})
export class Book extends JsonApiModel {
  @Attribute() title: string;

  @Attribute() date_published: Date;

  @Attribute() created_at: Date;

  @Attribute() updated_at: Date;

  @HasMany() chapters: Chapter[];

  @BelongsTo() firstChapter: Chapter;

  @BelongsTo() author: Author;

  @HasOne() company_publishing: Company;
}
