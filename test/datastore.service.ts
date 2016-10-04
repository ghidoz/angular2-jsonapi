import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { JsonApiDatastore, JsonApiDatastoreConfig } from '../src';
import { Author } from './models/author.model';
import { Book } from './models/book.model';
import { Chapter } from './models/chapter.model';

@Injectable()
@JsonApiDatastoreConfig({
  baseUrl: 'http://localhost:8080/v1/',
  models: {
    authors: Author,
    books: Book,
    chapters: Chapter
  }
})
export class Datastore extends JsonApiDatastore {

    constructor(http: Http) {
        super(http);
    }
}
