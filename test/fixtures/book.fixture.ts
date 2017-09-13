import {BOOK_PUBLISHED, BOOK_TITLE} from "./author.fixture";

export function getSampleBook(i: number, authorId: string, editorialId: string) {
    return {
        'id': '' + i,
        'type': 'books',
        'attributes': {
            'date_published': BOOK_PUBLISHED,
            'title': BOOK_TITLE,
            'created_at': '2016-09-26T21:12:41Z',
            'updated_at': '2016-09-26T21:12:41Z'
        },
        'relationships': {
            'chapters': {
                'links': {
                    'self': '/v1/books/1/relationships/chapters',
                    'related': '/v1/books/1/chapters'
                }
            },
            'firstChapter': {
                'links': {
                    'self': '/v1/books/1/relationships/firstChapter',
                    'related': '/v1/books/1/firstChapter'
                }
            },
            'author': {
                'links': {
                    'self': '/v1/books/1/relationships/author',
                    'related': '/v1/books/1/author'
                },
                'data': {
                    'id': authorId,
                    'type': 'authors'
                }
            },
            'editorial': {
                'links': {
                    'self': '/v1/books/1/relationships/editorial',
                    'related': '/v1/books/1/editorial'
                },
                'data': {
                    'id': editorialId,
                    'type': 'editorials'
                }
            }
        },
        'links': {
            'self': '/v1/books/1'
        }
    }
}