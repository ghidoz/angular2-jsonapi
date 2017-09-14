import {TestBed} from '@angular/core/testing';
import * as dateParse from 'date-fns/parse';
import * as qs from 'qs';
import {Editorial} from '../../test/models/editorial.model';
import {
    EDITORIAL_NAME,
    EDITORIAL_ID,
    getEditorialIncluded,
    getEditorialData
} from '../../test/fixtures/editorial.fixture';
import {Author} from '../../test/models/author.model';
import {AUTHOR_BIRTH,
        AUTHOR_ID,
        AUTHOR_NAME,
        BOOK_TITLE,
        getAuthorData,
        getAuthorIncluded} from '../../test/fixtures/author.fixture';
import {
    BaseRequestOptions,
    ConnectionBackend,
    Headers,
    Http,
    RequestMethod,
    Response,
    ResponseOptions
} from '@angular/http';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BASE_URL, Datastore} from '../../test/datastore.service';
import {ErrorResponse} from '../models/error-response.model';
import {getSampleBook} from '../../test/fixtures/book.fixture';
import {Book} from '../../test/models/book.model';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

let datastore: Datastore;
let httpMock: HttpTestingController;

// workaround, see https://github.com/angular/angular/pull/8961
class MockError extends Response implements Error {
    name: any;
    message: any;
}

describe('JsonApiDatastore', () => {

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule
            ],
            providers: [
                Datastore
            ]
        });
        httpMock    = TestBed.get(HttpTestingController);
        datastore   = TestBed.get(Datastore);
    });


    describe('query', () => {
        it('should build basic url', () => {
            datastore.query(Author).subscribe(response => expect(response[0] instanceof Author).toBeTruthy());
            const req = httpMock.expectOne(BASE_URL + 'authors');
            expect(req.request.method).toEqual('GET');
            expect(req.request.url).toEqual(BASE_URL + 'authors');
            req.flush({data: [getAuthorData()]});
            httpMock.verify();
        });

        it('should set JSON API headers', () => {
            datastore.query(Author).subscribe(response => expect(response[0] instanceof Author).toBeTruthy());
            const req = httpMock.expectOne(BASE_URL + 'authors');
            expect(req.request.method).toEqual('GET');
            expect(req.request.url).toEqual(BASE_URL + 'authors');
            expect(req.request.headers.get('Content-type')).toEqual('application/vnd.api+json');
            expect(req.request.headers.get('Accept')).toEqual('application/vnd.api+json');
            req.flush({data: [getAuthorData()]});
            httpMock.verify();
        });

        it('should build url with nested params', () => {
            datastore.query(Author, {
                page: {size: 10, number: 1},
                include: 'comments',
                filter: {
                    title: {
                        keyword: 'Tolkien'
                    }
                }
            }).subscribe();

            const req = httpMock.expectOne(BASE_URL + 'authors?' +
                encodeURIComponent('page[size]') + '=10&' +
                encodeURIComponent('page[number]') + '=1&' +
                encodeURIComponent('include') + '=comments&' +
                encodeURIComponent('filter[title][keyword]') + '=Tolkien'
            );

            expect(req.request.method).toEqual('GET');
            expect(req.request.url).not.toEqual(BASE_URL + 'authors');
            expect(req.request.url).toEqual(BASE_URL + 'authors?' +
                encodeURIComponent('page[size]') + '=10&' +
                encodeURIComponent('page[number]') + '=1&' +
                encodeURIComponent('include') + '=comments&' +
                encodeURIComponent('filter[title][keyword]') + '=Tolkien'
            );
            req.flush({data: [getAuthorData()]});
            httpMock.verify();
        });

        it('should have custom headers', () => {
            datastore.query(Author, null, new HttpHeaders({'Authorization': 'Bearer'}))
                .subscribe();
            const req = httpMock.expectOne(BASE_URL + 'authors');
            expect(req.request.method).toEqual('GET');
            expect(req.request.url).toEqual(BASE_URL + 'authors');
            expect(req.request.headers.get('authorization')).toBeTruthy();
            expect(req.request.headers.get('authorization')).toEqual('Bearer');
            req.flush({data: [getAuthorData()]});
            httpMock.verify();
        });

        it('should override base headers', () => {
            datastore.headers = new HttpHeaders({'Authorization': 'Bearer'});
            datastore.query(Author, null, new HttpHeaders({'Authorization': 'Basic'}))
                .subscribe();
            const req = httpMock.expectOne(BASE_URL + 'authors');
            expect(req.request.method).toEqual('GET');
            expect(req.request.url).toEqual(BASE_URL + 'authors');
            expect(req.request.headers.get('authorization')).toBeTruthy();
            expect(req.request.headers.get('authorization')).toEqual('Basic');
            req.flush({data: [getAuthorData()]});
            httpMock.verify();
        });

        it('should get authors', () => {
            datastore.query(Author).subscribe((authors) => {
                expect(authors).toBeDefined();
                expect(authors.length).toEqual(1);
                expect(authors[0].id).toEqual(AUTHOR_ID);
                expect(authors[0].name).toEqual(AUTHOR_NAME);
                expect(authors[1]).toBeUndefined();
            });
            const req = httpMock.expectOne(BASE_URL + 'authors');
            expect(req.request.method).toEqual('GET');
            expect(req.request.url).toEqual(BASE_URL + 'authors');
            req.flush({data: [getAuthorData()]});
            httpMock.verify();
        });

        it('should get authors with custom metadata', () => {
            datastore.findAll(Author).subscribe((document) => {
                expect(document).toBeDefined();
                expect(document.getModels().length).toEqual(1);
                expect(document.getMeta().meta.page.number).toEqual(1);
            });

            const req = httpMock.expectOne(BASE_URL + 'authors');
            expect(req.request.method).toEqual('GET');
            expect(req.request.url).toEqual(BASE_URL + 'authors');
            req.flush({
                data: [getAuthorData()],
                meta: {
                    page: {
                        number: 1,
                        size: 1,
                        total: 1,
                        last: 1
                    }
                }
            });
            httpMock.verify();
        });

        it('should get data with default metadata', () => {
            datastore.findAll(Book).subscribe((document) => {
                expect(document).toBeDefined();
                expect(document.getModels().length).toEqual(1);
                expect(document.getMeta().links[0]).toEqual('http://www.example.org');
            });

            const req = httpMock.expectOne(BASE_URL + 'books');
            req.flush({
                data: [getSampleBook(1, '1', '1')],
                links: ['http://www.example.org']
            });
            httpMock.verify();
        });

        it('should get models relationships', () => {
            datastore.findAll(Book).subscribe((document) => {
                expect(document).toBeDefined();
                expect(document.getModels().length).toEqual(1);
                expect(document.getMeta().links[0]).toEqual('http://www.example.org');
                expect(document['jsonApiModels'][0]['author']).toBeDefined();
            });

            const req = httpMock.expectOne(BASE_URL + 'books');
            req.flush({
                data: [getSampleBook(1, '1', '1')],
                links: ['http://www.example.org'],
                included: [
                    getAuthorIncluded()
                ]
            });
            httpMock.verify();
        });

        it('should fire error', () => {
            datastore.query(Author).subscribe((authors) =>
                fail('onNext has been called'),
                (response) => expect(response).toMatch(/500 Server Error/),
                () => fail('onCompleted has been called'));

            const req = httpMock.expectOne(BASE_URL + 'authors');

            req.flush({ foo: 'bar', data: [] }, { status: 500, statusText: 'Server Error' });
            httpMock.verify();
        });

        it('should generate correct query string for array params with findAll', () => {
            datastore.findAll(Book, { arrayParam: [4, 5, 6] }).subscribe();
            const req = httpMock.expectOne(
                BASE_URL +
                'books?' +
                qs.stringify({ arrayParam: [4, 5, 6] }, { arrayFormat: 'brackets' })
            );
            req.flush({data: []});
            expect(req.request.url.split('?')[1]).toEqual(qs.stringify(
                { arrayParam: [4, 5, 6] },
                { arrayFormat: 'brackets' }
            ));
            httpMock.verify();
        });

        it('should generate correct query string for array params with query', () => {
            datastore.query(Book, { arrayParam: [4, 5, 6] }).subscribe();
            const req = httpMock.expectOne(
                BASE_URL +
                'books?' +
                qs.stringify({ arrayParam: [4, 5, 6] }, { arrayFormat: 'brackets' })
            );
            req.flush({data: []});
            expect(req.request.url.split('?')[1]).toEqual(qs.stringify(
                { arrayParam: [4, 5, 6] },
                { arrayFormat: 'brackets' })
            );
            httpMock.verify();
        });
    });

    describe('findRecord', () => {
        it('should get author', () => {
            datastore.findRecord(Author, '1').subscribe((author) => {
                expect(author).toBeDefined();
                expect(author.id).toBe(AUTHOR_ID);
                expect(author.date_of_birth).toEqual(dateParse(AUTHOR_BIRTH));
            });

            const req = httpMock.expectOne(BASE_URL + 'authors/1');
            req.flush({ data: getAuthorData() });
            httpMock.verify();
        });

        it('should get editorial with hasOne relation author', () => {
            datastore.findRecord(Editorial, '1').subscribe((editorial) => {
                console.log('%c editorial: ', 'background-color: red; color: white;', editorial);
                expect(editorial).toBeDefined();
                expect(editorial.author).toBeDefined();
            });

            const req = httpMock.expectOne(BASE_URL + 'editorials/1');
            req.flush({
                data: getEditorialData(),
                included: [
                    getEditorialIncluded()
                ]
            });
            httpMock.verify();
        });

        it('should generate correct query string for array params with findRecord', () => {
            datastore.findRecord(Book, '1', { arrayParam: [4, 5, 6] }).subscribe();
            const req = httpMock.expectOne(
                BASE_URL +
                'books/1?' +
                qs.stringify({ arrayParam: [4, 5, 6] }, { arrayFormat: 'brackets' })
            );
            req.flush({});
            expect(req.request.url.split('?')[1]).toEqual(qs.stringify(
                { arrayParam: [4, 5, 6] },
                { arrayFormat: 'brackets' })
            );
            httpMock.verify();
        });
    });

    describe('saveRecord', () => {
        it('should create new author', () => {
            let author = datastore.createRecord(Author, {
                name: AUTHOR_NAME
            });
            author.save().subscribe();

            const req = httpMock.expectOne( BASE_URL + 'authors' );
            req.flush({data: author});
            expect(req.request.url).not.toEqual(BASE_URL);
            expect(req.request.url).toEqual(BASE_URL + 'authors');
            expect(req.request.method).toEqual('POST');
            let obj = req.request.body.data;
            expect(obj.attributes.name).toEqual(AUTHOR_NAME);
            expect(obj.id).toBeUndefined();
            expect(obj.type).toBe('authors');
            expect(obj.relationships).toBeUndefined();
            httpMock.verify();
        });

        it('should create new author with existing ToMany-relationship', () => {
            let author = datastore.createRecord(Author, {
                name: AUTHOR_NAME
            });
            author.books = [new Book(datastore, {
                id: '10',
                title: BOOK_TITLE
            })];
            author.save().subscribe();

            const req = httpMock.expectOne( BASE_URL + 'authors' );
            let obj = req.request.body.data;
            expect(obj.attributes.name).toEqual(AUTHOR_NAME);
            expect(obj.id).toBeUndefined();
            expect(obj.type).toBe('authors');
            expect(obj.relationships).not.toBeUndefined();
            expect(obj.relationships.books.data.length).toBe(1);
            expect(obj.relationships.books.data[0].id).toBe('10');
            httpMock.verify();
        });

        it('should create new author with new ToMany-relationship', () => {
            let author = datastore.createRecord(Author, {
                name: AUTHOR_NAME
            });
            author.books = [datastore.createRecord(Book, {
                title: BOOK_TITLE
            })];
            author.save().subscribe();

            const req = httpMock.expectOne( BASE_URL + 'authors' );
            let obj = req.request.body.data;
            expect(obj.attributes.name).toEqual(AUTHOR_NAME);
            expect(obj.id).toBeUndefined();
            expect(obj.type).toBe('authors');
            expect(obj.relationships).toBeDefined();
            expect(obj.relationships.books.data.length).toBe(1);
            expect(obj.relationships.books.data[0].attributes.title).toBe(BOOK_TITLE);
            httpMock.verify();
        });

        it('should create new editorial with new HasOne-relationship', () => {
            let editorial = datastore.createRecord(Editorial, {
                name: EDITORIAL_NAME
            });
            editorial.author = datastore.createRecord(Author, {
                name: AUTHOR_NAME
            });
            editorial.save().subscribe();

            const req = httpMock.expectOne( BASE_URL + 'editorials' );
            let obj = req.request.body.data;
            expect(obj.attributes.name).toEqual(EDITORIAL_NAME);
            expect(obj.id).toBeUndefined();
            expect(obj.type).toBe('editorials');
            expect(obj.relationships).toBeDefined();
            expect(obj.relationships.author).toBeDefined();
            expect(obj.relationships.author.data.attributes.name).toBe(AUTHOR_NAME);
            httpMock.verify();
        })

        it('should create new author with existing BelongsTo-relationship', () => {
            let book = datastore.createRecord(Book, {
                title: BOOK_TITLE
            });
            book.author = new Author(datastore, {
                id: AUTHOR_ID
            });
            book.save().subscribe();

            const req = httpMock.expectOne( BASE_URL + 'books' );
            let obj = req.request.body.data;
            // expect(obj.attributes.name).toEqual(AUTHOR_NAME);
            expect(obj.id).toBeUndefined();
            expect(obj.type).toBe('books');
            expect(obj.relationships).toBeDefined();
            expect(Object.keys(obj.relationships).length).toBe(1);
            // expect(obj.relationships.author.data[0].attributes.title).toBe(BOOK_TITLE);
            httpMock.verify();
        });
    });

    describe('updateRecord', () => {
        it('should update author', () => {
            let author = new Author(datastore, {
                name: AUTHOR_NAME,
                id: AUTHOR_ID
            });
            author.save().subscribe();
            const req = httpMock.expectOne( BASE_URL + 'authors/1' );

            expect(req.request.url).not.toEqual(BASE_URL);
            expect(req.request.url).toEqual(BASE_URL + 'authors/1');
            expect(req.request.method).toEqual('PATCH');

            let obj = req.request.body.data;
            expect(obj.attributes.name).toEqual(AUTHOR_NAME);
            expect(obj.id).toBe(AUTHOR_ID);
            expect(obj.type).toBe('authors');
            expect(obj.relationships).toBeUndefined();

            httpMock.verify();
        });
    });
});