import {TestBed} from '@angular/core/testing';
import { Author } from '../../test/models/author.model';
import {
    AUTHOR_ID, AUTHOR_NAME, AUTHOR_BIRTH,
    getAuthorData
} from '../../test/fixtures/author.fixture';
import {
    Http, BaseRequestOptions, ConnectionBackend, Response, ResponseOptions,
    RequestMethod, Headers
} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing';
import {Datastore, BASE_URL} from '../../test/datastore.service';
import {ErrorResponse} from '../models/error-response.model';


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
                    provide: Http, useFactory: (connectionBackend: ConnectionBackend, defaultOptions: BaseRequestOptions) => {
                    return new Http(connectionBackend, defaultOptions);
                }, deps: [MockBackend, BaseRequestOptions]
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

                expect(c.request.url).toEqual(BASE_URL + "authors");
                expect(c.request.method).toEqual(RequestMethod.Get);
            });
            datastore.query(Author).subscribe();
        });

        it('should set JSON API headers', () => {
            backend.connections.subscribe((c: MockConnection) => {
                expect(c.request.url).toEqual(BASE_URL + "authors");
                expect(c.request.method).toEqual(RequestMethod.Get);
                expect(c.request.headers.get("Content-Type")).toEqual("application/vnd.api+json");
                expect(c.request.headers.get("Accept")).toEqual("application/vnd.api+json");
            });
            datastore.query(Author).subscribe();
        });

        it('should build url with params', () => {
            backend.connections.subscribe((c: MockConnection) => {
                expect(c.request.url).not.toEqual(BASE_URL);
                expect(c.request.url).toEqual(BASE_URL + "authors?page[size]=10&page[number]=1&include=comments");
                expect(c.request.method).toEqual(RequestMethod.Get);
            });
            datastore.query(Author, {
                page: { size: 10, number: 1},
                include: 'comments'
            }).subscribe();
        });

        it('should have custom headers', () => {
            backend.connections.subscribe((c: MockConnection) => {
                expect(c.request.url).toEqual(BASE_URL + "authors");
                expect(c.request.method).toEqual(RequestMethod.Get);
                expect(c.request.headers.has("Authorization")).toBeTruthy();
                expect(c.request.headers.get("Authorization")).toBe("Bearer");
            });
            datastore.query(Author, null, new Headers({"Authorization": "Bearer"}))
                .subscribe();
        });

        it('should override base headers', () => {
            backend.connections.subscribe((c: MockConnection) => {
                expect(c.request.url).toEqual(BASE_URL + "authors");
                expect(c.request.method).toEqual(RequestMethod.Get);
                expect(c.request.headers.has("Authorization")).toBeTruthy();
                expect(c.request.headers.get("Authorization")).toBe("Basic");
            });
            datastore.headers = new Headers({"Authorization": "Bearer"});
            datastore.query(Author, null, new Headers({"Authorization": "Basic"}))
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
                expect(author.date_of_birth).toEqual(AUTHOR_BIRTH);
            });
        });


    });


});
