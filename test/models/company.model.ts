import { Book } from "./book.model";
import { JsonApiModel } from "../../src/models/json-api.model";
import { JsonApiModelConfig } from "../../src/decorators/json-api-model-config.decorator";
import { Attribute } from "../../src/decorators/attribute.decorator";
import { BelongsTo } from "../../src/decorators/belongs-to.decorator";

@JsonApiModelConfig({
  type: "company"
})
export class Company extends JsonApiModel {
  @Attribute() name: string;

  @BelongsTo() book: Book;
}
