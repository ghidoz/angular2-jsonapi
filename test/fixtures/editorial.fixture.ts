export const EDITORIAL_ID = '1';
export const EDITORIAL_NAME = 'Editorial example';
export const EDITORIAL_CREATED = '2016-09-26T21:12:40Z';
export const EDITORIAL_UPDATED = '2016-09-26T21:12:45Z';

import { AUTHOR_ID, AUTHOR_NAME } from './author.fixture';

export function getEditorialrData(relationship?: string, total?: number): any {
  let response: any = {
    'id': EDITORIAL_ID,
    'type': 'editorials',
    'attributes': {
      'name': EDITORIAL_NAME,
      'created_at': EDITORIAL_CREATED,
      'updated_at': EDITORIAL_UPDATED
    },
    'relationships': {
      'books': {'links': {'self': '/v1/authors/1/relationships/books', 'related': '/v1/authors/1/books'}},
      'author': {
        'links': {
          'self': '/v1/editorials/1/relationships/author',
          'related': '/v1/editorials/1/author'
        },
        'data': {
          'id': AUTHOR_ID,
          'name': AUTHOR_NAME,
          'type': 'authors'
        }
      }
    },
    'links': {'self': '/v1/authors/1'}
  };
  if (relationship && relationship.indexOf('books') !== -1) {
    response.relationships.books.data = [];
    for (let i = 1; i <= total; i++) {
      response.relationships.books.data.push({
        'id': '' + i,
        'type': 'books'
      });
    }
  }
  return response;
};

export function getEditorialIncluded() {
  return {
    'id': EDITORIAL_ID,
    'type': 'editorials',
    'links': { 'self': '/v1/editorials/1' },
    'attributes': {
      'name': EDITORIAL_NAME,
      'created_at': EDITORIAL_CREATED,
      'updated_at': EDITORIAL_UPDATED
    },
    'relationships': {
      'author': {
        'links': {
          'self': '/v1/editorials/1/relationships/author',
          'related': '/v1/editorials/1/author'
        }
      }
    }
  }
}
