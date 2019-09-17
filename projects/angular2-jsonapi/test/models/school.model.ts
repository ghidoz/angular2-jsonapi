import { JsonApiNestedModel } from '../../src/models/json-nested.model';
import { JsonAttribute } from '../../src/decorators/json-attribute.decorator';

export class School extends JsonApiNestedModel {

  @JsonAttribute()
  public name: string;

  @JsonAttribute()
  public students: number;

  @JsonAttribute()
  public foundation: Date;
}
