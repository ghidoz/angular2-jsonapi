import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonApiDatastore, JsonApiDatastoreConfig } from '../src';
import { Author } from './models/author.model';
import { Book } from './models/book.model';
import { Chapter } from './models/chapter.model';
import { Section } from './models/section.model';
import { Paragraph } from './models/paragraph.model';
import { Sentence } from './models/sentence.model';
import { Category } from './models/category.model';

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
  }
})
export class Datastore extends JsonApiDatastore {
  constructor(http: HttpClient) {
    super(http);
  }
}
