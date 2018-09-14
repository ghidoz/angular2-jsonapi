import { JsonAttribute, JsonNestedApiModel } from '../../src';

export class School extends JsonNestedApiModel {

  @JsonAttribute()
  public name: string;

  @JsonAttribute()
  public students: number;

  @JsonAttribute()
  public foundation: Date;
}
