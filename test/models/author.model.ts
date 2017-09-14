import { Book } from './book.model';
import { Editorial } from './editorial.model';
import { JsonApiModelConfig } from '../../src/decorators/json-api-model-config.decorator';
import { JsonApiModel } from '../../src/models/json-api.model';
import { Attribute } from '../../src/decorators/attribute.decorator';
import { HasMany } from '../../src/decorators/has-many.decorator';
import { BelongsTo } from '../../src/decorators/belongs-to.decorator';
import {PageMetaData} from "./page-meta-data";

@JsonApiModelConfig({
    type: 'authors',
    type_one: 'author',
    meta: PageMetaData
})
export class Author extends JsonApiModel {

    @Attribute()
    name: string;

    @Attribute()
    date_of_birth: Date;

    @Attribute()
    date_of_death: Date;

    @Attribute()
    created_at: Date;

    @Attribute()
    updated_at: Date;

    @HasMany()
    books: Book[];

    @BelongsTo()
    editorial: Editorial;
}
