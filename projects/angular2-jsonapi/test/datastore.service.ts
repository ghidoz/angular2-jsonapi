import { HttpClient } from '@angular/common/http';
import { Author } from './models/author.model';
import { Book } from './models/book.model';
import { Chapter } from './models/chapter.model';
import { Section } from './models/section.model';
import { Paragraph } from './models/paragraph.model';
import { Sentence } from './models/sentence.model';
import { Category } from './models/category.model';
import { Thing } from './models/thing';
import { ThingCategory } from './models/thingCategory';
import { JsonApiDatastoreConfig } from '../src/decorators/json-api-datastore-config.decorator';
import { JsonApiDatastore } from '../src/services/json-api-datastore.service';

export const BASE_URL = 'http://localhost:8080';
export const API_VERSION = 'v1';

@JsonApiDatastoreConfig({
  baseUrl: BASE_URL,
  apiVersion: API_VERSION,
  models: {
    authors: Author,
    books: Book,
    chapters: Chapter,
    categories: Category,
    paragraphs: Paragraph,
    sections: Section,
    sentences: Sentence,
    thing: Thing,
    thing_category: ThingCategory
  }
})
export class Datastore extends JsonApiDatastore {
  constructor(http: HttpClient) {
    super(http);
  }
}
