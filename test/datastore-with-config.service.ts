import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { JsonApiDatastore, JsonApiDatastoreConfig, DatastoreConfig } from '../src';
import { Author } from './models/author.model';
import { Book } from './models/book.model';
import { Chapter } from './models/chapter.model';

const BASE_URL = 'http://localhost:8080';
const API_VERSION = 'v1';

export const BASE_URL_FROM_CONFIG = 'http://localhost:8888';
export const API_VERSION_FROM_CONFIG = 'v2';

@JsonApiDatastoreConfig({
  baseUrl: BASE_URL,
  apiVersion: API_VERSION,
  models: {
    authors: Author,
    books: Book,
    chapters: Chapter
  }
})
export class DatastoreWithConfig extends JsonApiDatastore {
  protected config: DatastoreConfig = {
    baseUrl: BASE_URL_FROM_CONFIG,
    apiVersion: API_VERSION_FROM_CONFIG
  };

  constructor(http: Http) {
    super(http);
  }
}
