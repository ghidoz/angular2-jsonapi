export const EDITORIAL_ID = '1';
export const EDITORIAL_NAME = 'Editorial example';
export const EDITORIAL_CREATED = '2016-09-26T21:12:40Z';
export const EDITORIAL_UPDATED = '2016-09-26T21:12:45Z';

import { AUTHOR_ID, AUTHOR_NAME } from './author.fixture';

export function getEditorialData(relationship?: string, total?: number): any {
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
    'links': {'self': '/v1/editorials/1'}
  };
  if (relationship && relationship.indexOf('author') !== -1) {
    response.relationships.author.data = {
      'id': '1',
      'type': 'books'
    };
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

export function getSampleEditorial(i: number, authorId: string) {
  return {
      'id': '' + i,
      'type': 'editorials',
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
              },
              'data': {
                  'id': authorId,
                  'type': 'authors'
              }
          }
      },
      'links': {
          'self': '/v1/editorials/1'
      }
  }
}