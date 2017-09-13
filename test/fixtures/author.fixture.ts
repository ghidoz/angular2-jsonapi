import {getSampleBook} from "./book.fixture";
export const AUTHOR_ID = '1';
export const AUTHOR_NAME = 'J. R. R. Tolkien';
export const AUTHOR_BIRTH = '1892-01-03';
export const AUTHOR_DEATH = '1973-09-02';
export const AUTHOR_CREATED = '2016-09-26T21:12:40Z';
export const AUTHOR_UPDATED = '2016-09-26T21:12:45Z';

export const BOOK_TITLE = 'The Fellowship of the Ring';
export const BOOK_PUBLISHED = '1954-07-29';

export const CHAPTER_TITLE = 'The Return Journey';

export function getAuthorData(relationship?: string, total?: number): any {
  let response: any = {
    'id': AUTHOR_ID,
    'type': 'authors',
    'attributes': {
      'name': AUTHOR_NAME,
      'date_of_birth': AUTHOR_BIRTH,
      'date_of_death': AUTHOR_DEATH,
      'created_at': AUTHOR_CREATED,
      'updated_at': AUTHOR_UPDATED
    },
    'relationships': {
      'books': {'links': {'self': '/v1/authors/1/relationships/books', 'related': '/v1/authors/1/books'}}
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

export function getAuthorIncluded() {
  return {
    'id': AUTHOR_ID,
    'type': 'authors',
    'links': { 'self': '/v1/authors/1' },
    'attributes': {
      'name': AUTHOR_NAME,
      'date_of_birth': AUTHOR_BIRTH,
      'date_of_death': AUTHOR_DEATH,
      'created_at': AUTHOR_CREATED,
      'updated_at': AUTHOR_UPDATED
    },
    'relationships': {
      'books': {
        'links': {
          'self': '/v1/authors/1/relationships/books',
          'related': '/v1/authors/1/books'
        }
      }
    }
  }
}

export function getIncludedBooks(totalBooks: number, relationship?: string, totalChapters?: number): any[] {
  let responseArray: any[] = [];
  let chapterId = 0;
  for (let i = 1; i <= totalBooks; i++) {
    let book: any = getSampleBook(i, AUTHOR_ID);
    if (relationship && relationship.indexOf('books.chapters') !== -1) {
      book.relationships.chapters.data = [];
      for (let ic = 1; ic <= totalChapters; ic++) {
        chapterId++;
        book.relationships.chapters.data.push({
          'id': '' + chapterId,
          'type': 'chapters'
        });
        responseArray.push({
          'id': '' + chapterId,
          'type': 'chapters',
          'attributes': {
            'title': CHAPTER_TITLE,
            'ordering': chapterId,
            'created_at': '2016-10-01T12:54:32Z',
            'updated_at': '2016-10-01T12:54:32Z'
          },
          'relationships': {
            'book': {
              'links': {
                'self': '/v1/authors/288/relationships/book',
                'related': '/v1/authors/288/book'
              },
              'data': {
                'id': '' + i,
                'type': 'books'
              }
            }
          },
          'links': {'self': '/v1/authors/288'}
        });
      }
    }
    responseArray.push(book);
  }
  return responseArray;
}
