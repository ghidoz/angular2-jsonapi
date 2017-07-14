import { Company } from './models/company.model';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { JsonApiDatastore, JsonApiDatastoreConfig } from '../src';
import { Author } from './models/author.model';
import { Book } from './models/book.model';
import { Chapter } from './models/chapter.model';

export const BASE_URL = 'http://localhost:8080/v1/'

@Injectable()
@JsonApiDatastoreConfig({
  baseUrl: BASE_URL,
  models: {
    authors: Author,
    books: Book,
    chapters: Chapter,
    company_publishing :Company
  }
})
export class Datastore extends JsonApiDatastore {

    constructor(http: Http) {
        super(http);
    }
}
