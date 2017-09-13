import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonApiDatastore, JsonApiDatastoreConfig } from '../src';
import { Author } from './models/author.model';
import { Book } from './models/book.model';
import { Chapter } from './models/chapter.model';
import { Editorial } from './models/editorial.model';

export const BASE_URL = 'http://localhost:8080/v1/'

@Injectable()
@JsonApiDatastoreConfig({
  baseUrl: BASE_URL,
  models: {
    authors: Author,
    books: Book,
    chapters: Chapter,
    editorials: Editorial
  }
})
export class Datastore extends JsonApiDatastore {

    constructor(httpClient: HttpClient) {
        super(httpClient);
    }
}
