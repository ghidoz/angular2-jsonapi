// import {BOOK_PUBLISHED, BOOK_TITLE} from "./author.fixture";

// export function getSampleComment(i: number, authorId: string) {
//     return {
//         'id': '' + i,
//         'type': 'comments',
//         'attributes': {
//             'message': 'this is a comment',
//             'created_at': '2016-09-26T21:12:41Z',
//             'updated_at': '2016-09-26T21:12:41Z'
//         },
//         'relationships': {
//             'chapters': {
//                 'links': {
//                     'self': '/v1/books/1/relationships/chapters',
//                     'related': '/v1/books/1/chapters'
//                 }
//             },
//             'firstChapter': {
//                 'links': {
//                     'self': '/v1/books/1/relationships/firstChapter',
//                     'related': '/v1/books/1/firstChapter'
//                 }
//             },
//             'author': {
//                 'links': {
//                     'self': '/v1/books/1/relationships/author',
//                     'related': '/v1/books/1/author'
//                 },
//                 'data': {
//                     'id': authorId,
//                     'type': 'authors'
//                 }
//             }
//         },
//         'links': {
//             'self': '/v1/books/1'
//         }
//     }
// }