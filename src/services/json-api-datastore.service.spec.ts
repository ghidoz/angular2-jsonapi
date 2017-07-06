import {TestBed} from '@angular/core/testing';
import {Author} from '../../test/models/author.model';
import {AUTHOR_BIRTH, AUTHOR_ID, AUTHOR_NAME, BOOK_TITLE, getAuthorData} from '../../test/fixtures/author.fixture';
import {
    BaseRequestOptions,
    ConnectionBackend,
    Headers,
    Http,
    RequestMethod,
    Response,
    ResponseOptions
} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing';
import {BASE_URL, Datastore} from '../../test/datastore.service';
import {ErrorResponse} from '../models/error-response.model';
import * as moment from 'moment';
import {getSampleBook} from '../../test/fixtures/book.fixture';
import {Book} from '../../test/models/book.model';


let datastore: Datastore;
let backend: MockBackend;

// workaround, see https://github.com/angular/angular/pull/8961
class MockError extends Response implements Error {
    name: any;
    message: any;
}

describe('JsonApiDatastore', () => {

    beforeEach(() => {

        TestBed.configureTestingModule({
            providers: [
                {
                    provide: Http,
                    useFactory: (connectionBackend: ConnectionBackend, defaultOptions: BaseRequestOptions) => {
                        return new Http(connectionBackend, defaultOptions);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                MockBackend,
                BaseRequestOptions,
                Datastore
            ]
        });

        datastore = TestBed.get(Datastore);
        backend = TestBed.get(MockBackend);

    });


    describe('query', () => {

        it('should build basic url', () => {
            backend.connections.subscribe((c: MockConnection) => {

                expect(c.request.url).toEqual(BASE_URL + 'authors');
                expect(c.request.method).toEqual(RequestMethod.Get);
            });
            datastore.query(Author).subscribe();
        });

        it('should set JSON API headers', () => {
            backend.connections.subscribe((c: MockConnection) => {
                expect(c.request.url).toEqual(BASE_URL + 'authors');
                expect(c.request.method).toEqual(RequestMethod.Get);
                expect(c.request.headers.get('Content-Type')).toEqual('application/vnd.api+json');
                expect(c.request.headers.get('Accept')).toEqual('application/vnd.api+json');
            });
            datastore.query(Author).subscribe();
        });

        it('should build url with nested params', () => {
            backend.connections.subscribe((c: MockConnection) => {
                expect(c.request.url).not.toEqual(BASE_URL);
                expect(c.request.url).toEqual(BASE_URL + 'authors?' +
                encodeURIComponent('page[size]') + '=10&' +
                encodeURIComponent('page[number]') + '=1&' +
                encodeURIComponent('include') + '=comments&' +
                encodeURIComponent('filter[title][keyword]') + '=Tolkien');
                expect(c.request.method).toEqual(RequestMethod.Get);
            });
            datastore.query(Author, {
                page: {size: 10, number: 1},
                include: 'comments',
                filter: {
                    title: {
                        keyword: 'Tolkien'
                    }
                }
            }).subscribe();
        });

        it('should have custom headers', () => {
            backend.connections.subscribe((c: MockConnection) => {
                expect(c.request.url).toEqual(BASE_URL + 'authors');
                expect(c.request.method).toEqual(RequestMethod.Get);
                expect(c.request.headers.has('Authorization')).toBeTruthy();
                expect(c.request.headers.get('Authorization')).toBe('Bearer');
            });
            datastore.query(Author, null, new Headers({'Authorization': 'Bearer'}))
                .subscribe();
        });

        it('should override base headers', () => {
            backend.connections.subscribe((c: MockConnection) => {
                expect(c.request.url).toEqual(BASE_URL + 'authors');
                expect(c.request.method).toEqual(RequestMethod.Get);
                expect(c.request.headers.has('Authorization')).toBeTruthy();
                expect(c.request.headers.get('Authorization')).toBe('Basic');
            });
            datastore.headers = new Headers({'Authorization': 'Bearer'});
            datastore.query(Author, null, new Headers({'Authorization': 'Basic'}))
                .subscribe();
        });

        it('should get authors', () => {
            backend.connections.subscribe((c: MockConnection) => {
                c.mockRespond(new Response(
                    new ResponseOptions({
                        body: JSON.stringify({
                            data: [getAuthorData()]
                        })
                    })
                ));
            });
            datastore.query(Author).subscribe((authors) => {
                expect(authors).toBeDefined();
                expect(authors.length).toEqual(1);
                expect(authors[0].id).toEqual(AUTHOR_ID);
                expect(authors[0].name).toEqual(AUTHOR_NAME);
                expect(authors[1]).toBeUndefined();
            });
        });

        it('should get authors with custom metadata', () => {
            backend.connections.subscribe((c: MockConnection) => {
                c.mockRespond(new Response(
                    new ResponseOptions({
                        body: JSON.stringify({
                            data: [getAuthorData()],
                            meta: {
                                page: {
                                    number: 1,
                                    size: 1,
                                    total: 1,
                                    last: 1
                                }
                            }
                        })
                    })
                ));
            });
            datastore.findAll(Author).subscribe((document) => {
                console.log(document);

                expect(document).toBeDefined();
                expect(document.getModels().length).toEqual(1);
                expect(document.getMeta().meta.page.number).toEqual(1);
            });
        });

        it('should get data with default metadata', () => {
            backend.connections.subscribe((c: MockConnection) => {
                c.mockRespond(new Response(
                    new ResponseOptions({
                        body: JSON.stringify({
                            data: [getSampleBook(1, '1')],
                            links: ['http://www.example.org']
                        })
                    })
                ));
            });
            datastore.findAll(Book).subscribe((document) => {
                expect(document).toBeDefined();
                expect(document.getModels().length).toEqual(1);
                expect(document.getMeta().links[0]).toEqual('http://www.example.org');
            });
        });

        it('should fire error', () => {
            let resp = {
                errors: [
                    {
                        code: '100',
                        title: 'Example error',
                        detail: 'detailed error Message'
                    }
                ]
            };

            backend.connections.subscribe((c: MockConnection) => {
                c.mockError(new MockError(
                    new ResponseOptions({
                        body: JSON.stringify(resp),
                        status: 500
                    })
                ));
            });
            datastore.query(Author).subscribe((authors) => fail('onNext has been called'),
                (response) => {
                    expect(response).toEqual(jasmine.any(ErrorResponse));
                    expect(response.errors.length).toEqual(1);
                    expect(response.errors[0].code).toEqual(resp.errors[0].code);
                    expect(response.errors[0].title).toEqual(resp.errors[0].title);
                    expect(response.errors[0].detail).toEqual(resp.errors[0].detail);
                },
                () => fail('onCompleted has been called'));
        });
    });

    describe('findRecord', () => {
        it('should get author', () => {
            backend.connections.subscribe((c: MockConnection) => {
                c.mockRespond(new Response(
                    new ResponseOptions({
                        body: JSON.stringify({
                            data: getAuthorData()
                        })
                    })
                ));
            });
            datastore.findRecord(Author, '1').subscribe((author) => {
                expect(author).toBeDefined();
                expect(author.id).toBe(AUTHOR_ID);
                expect(author.date_of_birth).toEqual(moment(AUTHOR_BIRTH, 'YYYY-MM-DD').toDate());
            });
        });

    });

    describe('saveRecord', () => {
        it('should create new author', () => {
            backend.connections.subscribe((c: MockConnection) => {
                expect(c.request.url).not.toEqual(BASE_URL);
                expect(c.request.url).toEqual(BASE_URL + 'authors');
                expect(c.request.method).toEqual(RequestMethod.Post);
                let obj = c.request.json().data;
                expect(obj.attributes.name).toEqual(AUTHOR_NAME);
                expect(obj.id).toBeUndefined();
                expect(obj.type).toBe('authors');
                expect(obj.relationships).toBeUndefined();

            });
            let author = datastore.createRecord(Author, {
                name: AUTHOR_NAME
            });
            author.save().subscribe();
        });

        it('should create new author with existing ToMany-relationship', () => {
            backend.connections.subscribe((c: MockConnection) => {
                let obj = c.request.json().data;
                expect(obj.attributes.name).toEqual(AUTHOR_NAME);
                expect(obj.id).toBeUndefined();
                expect(obj.type).toBe('authors');
                expect(obj.relationships).toBeDefined();
                expect(obj.relationships.books.data.length).toBe(1);
                expect(obj.relationships.books.data[0].id).toBe('10');
            });
            let author = datastore.createRecord(Author, {
                name: AUTHOR_NAME
            });
            author.books = [new Book(datastore, {
                id: '10',
                title: BOOK_TITLE
            })];
            author.save().subscribe();
        });

        it('should create new author with new ToMany-relationship', () => {
            backend.connections.subscribe((c: MockConnection) => {
                let obj = c.request.json().data;
                expect(obj.attributes.name).toEqual(AUTHOR_NAME);
                expect(obj.id).toBeUndefined();
                expect(obj.type).toBe('authors');
                expect(obj.relationships).toBeDefined();
                expect(obj.relationships.books.data.length).toBe(1);
                expect(obj.relationships.books.data[0].attributes.title).toBe(BOOK_TITLE);
            });
            let author = datastore.createRecord(Author, {
                name: AUTHOR_NAME
            });
            author.books = [datastore.createRecord(Book, {
                title: BOOK_TITLE
            })];
            author.save().subscribe();
        });

        it('should create new author with existing BelongsTo-relationship', () => {
            backend.connections.subscribe((c: MockConnection) => {
                let obj = c.request.json().data;
                expect(obj.attributes.title).toEqual(BOOK_TITLE);
                expect(obj.id).toBeUndefined();
                expect(obj.type).toBe('books');
                expect(obj.relationships).toBeDefined();
                expect(obj.relationships.author.data.id).toBe(AUTHOR_ID);
            });
            let book = datastore.createRecord(Book, {
                title: BOOK_TITLE
            });
            book.author = new Author(datastore, {
                id: AUTHOR_ID
            });
           book.save().subscribe();
        });
    });

    describe('updateRecord', () => {
        it('should update author', () => {
            backend.connections.subscribe((c: MockConnection) => {
                expect(c.request.url).not.toEqual(BASE_URL);
                expect(c.request.url).toEqual(BASE_URL + 'authors/1');
                expect(c.request.method).toEqual(RequestMethod.Patch);
                let obj = c.request.json().data;
                expect(obj.attributes.name).toEqual(AUTHOR_NAME);
                expect(obj.id).toBe(AUTHOR_ID);
                expect(obj.type).toBe('authors');
                expect(obj.relationships).toBeUndefined();

            });
            let author = new Author(datastore, {
                name: AUTHOR_NAME,
                id: AUTHOR_ID
            });
            author.save().subscribe();
        });
    });
});
