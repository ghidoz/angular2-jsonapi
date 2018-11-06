import { TestBed } from '@angular/core/testing';
import { format, parse } from 'date-fns';
import { Author } from '../../test/models/author.model';
import { AUTHOR_API_VERSION, AUTHOR_MODEL_ENDPOINT_URL, CustomAuthor } from '../../test/models/custom-author.model';
import { AUTHOR_BIRTH, AUTHOR_ID, AUTHOR_NAME, BOOK_TITLE, getAuthorData } from '../../test/fixtures/author.fixture';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { API_VERSION, BASE_URL, Datastore } from '../../test/datastore.service';
import { ErrorResponse } from '../models/error-response.model';
import { getSampleBook } from '../../test/fixtures/book.fixture';
import { Book } from '../../test/models/book.model';
import { ModelConfig } from '../index';
import {
  API_VERSION_FROM_CONFIG,
  BASE_URL_FROM_CONFIG,
  DatastoreWithConfig
} from '../../test/datastore-with-config.service';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';


let datastore: Datastore;
let datastoreWithConfig: DatastoreWithConfig;
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
        HttpClientTestingModule,
      ],
      providers: [
        Datastore,
        DatastoreWithConfig,
      ]
    });

    datastore = TestBed.get(Datastore);
    datastoreWithConfig = TestBed.get(DatastoreWithConfig);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('query', () => {
    it('should build basic url from the data from datastore decorator', () => {
      const authorModelConfig: ModelConfig = Reflect.getMetadata('JsonApiModelConfig', Author);
      const expectedUrl = `${BASE_URL}/${API_VERSION}/${authorModelConfig.type}`;

      datastore.query(Author).subscribe();

      const queryRequest = httpMock.expectOne({ method: 'GET', url: expectedUrl });
      queryRequest.flush({ data: [] });
    });

    it('should build basic url and apiVersion from the config variable if exists', () => {
      const authorModelConfig: ModelConfig = Reflect.getMetadata('JsonApiModelConfig', Author);
      const expectedUrl = `${BASE_URL_FROM_CONFIG}/${API_VERSION_FROM_CONFIG}/${authorModelConfig.type}`;

      datastoreWithConfig.query(Author).subscribe();

      const queryRequest = httpMock.expectOne({ method: 'GET', url: expectedUrl });
      queryRequest.flush({ data: [] });
    });

    // tslint:disable-next-line:max-line-length
    it('should use apiVersion and modelEnpointUrl from the model instead of datastore if model has apiVersion and/or modelEndpointUrl specified', () => {
      const authorModelConfig: ModelConfig = Reflect.getMetadata('JsonApiModelConfig', CustomAuthor);
      const expectedUrl = `${BASE_URL_FROM_CONFIG}/${AUTHOR_API_VERSION}/${AUTHOR_MODEL_ENDPOINT_URL}`;

      datastoreWithConfig.query(CustomAuthor).subscribe();

      const queryRequest = httpMock.expectOne({ method: 'GET', url: expectedUrl });
      queryRequest.flush({ data: [] });
    });

    it('should set JSON API headers', () => {
      const expectedUrl = `${BASE_URL}/${API_VERSION}/authors`;

      datastore.query(Author).subscribe();

      const queryRequest = httpMock.expectOne({ method: 'GET', url: expectedUrl });
      expect(queryRequest.request.headers.get('Content-Type')).toEqual('application/vnd.api+json');
      expect(queryRequest.request.headers.get('Accept')).toEqual('application/vnd.api+json');
      queryRequest.flush({ data: [] });
    });

    it('should build url with nested params', () => {
      const queryData = {
        page: {
          size: 10, number: 1
        },
        include: 'comments',
        filter: {
          title: {
            keyword: 'Tolkien'
          }
        }
      };
      const expectedUrl = `${BASE_URL}/${API_VERSION}/` + 'authors?' +
        encodeURIComponent('page[size]') + '=10&' +
        encodeURIComponent('page[number]') + '=1&' +
        encodeURIComponent('include') + '=comments&' +
        encodeURIComponent('filter[title][keyword]') + '=Tolkien';

      datastore.query(Author, queryData).subscribe();

      httpMock.expectNone(`${BASE_URL}/${API_VERSION}`);
      const queryRequest = httpMock.expectOne({ method: 'GET', url: expectedUrl });
      queryRequest.flush({ data: [] });
    });

    it('should have custom headers', () => {
      const expectedUrl = `${BASE_URL}/${API_VERSION}/authors`;

      datastore.query(Author, null, new HttpHeaders({ Authorization: 'Bearer' })).subscribe();

      const queryRequest = httpMock.expectOne({ method: 'GET', url: expectedUrl });
      expect(queryRequest.request.headers.get('Authorization')).toEqual('Bearer');
      queryRequest.flush({ data: [] });
    });

    it('should override base headers', () => {
      const expectedUrl = `${BASE_URL}/${API_VERSION}/authors`;

      datastore.headers = new HttpHeaders({ Authorization: 'Bearer' });
      datastore.query(Author, null, new HttpHeaders({ Authorization: 'Basic' })).subscribe();

      const queryRequest = httpMock.expectOne({ method: 'GET', url: expectedUrl });
      expect(queryRequest.request.headers.get('Authorization')).toEqual('Basic');
      queryRequest.flush({ data: [] });
    });

    it('should get authors', () => {
      const expectedUrl = `${BASE_URL}/${API_VERSION}/authors`;

      datastore.query(Author).subscribe((authors) => {
        expect(authors).toBeDefined();
        expect(authors.length).toEqual(1);
        expect(authors[0].id).toEqual(AUTHOR_ID);
        expect(authors[0].name).toEqual(AUTHOR_NAME);
        expect(authors[1]).toBeUndefined();
      });

      const queryRequest = httpMock.expectOne(expectedUrl);
      queryRequest.flush({ data: [getAuthorData()] });
    });

    it('should get authors with custom metadata', () => {
      const expectedUrl = `${BASE_URL}/${API_VERSION}/authors`;

      datastore.findAll(Author).subscribe((document) => {
        expect(document).toBeDefined();
        expect(document.getModels().length).toEqual(1);
        expect(document.getMeta().meta.page.number).toEqual(1);
      });

      const findAllRequest = httpMock.expectOne(expectedUrl);
      findAllRequest.flush({
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
    });

    it('should get data with default metadata', () => {
      const expectedUrl = `${BASE_URL}/${API_VERSION}/books`;

      datastore.findAll(Book).subscribe((document) => {
        expect(document).toBeDefined();
        expect(document.getModels().length).toEqual(1);
        expect(document.getMeta().links[0]).toEqual('http://www.example.org');
      });

      const findAllRequest = httpMock.expectOne(expectedUrl);
      findAllRequest.flush({
        data: [getSampleBook(1, '1')],
        links: ['http://www.example.org']
      });
    });

    it('should fire error', () => {
      const expectedUrl = `${BASE_URL}/${API_VERSION}/authors`;
      const dummyResponse = {
        errors: [
          {
            code: '100',
            title: 'Example error',
            detail: 'detailed error Message'
          }
        ]
      };

      datastore.query(Author).subscribe(
        (authors) => fail('onNext has been called'),
        (response) => {
          expect(response).toEqual(jasmine.any(ErrorResponse));
          expect(response.errors.length).toEqual(1);
          expect(response.errors[0].code).toEqual(dummyResponse.errors[0].code);
          expect(response.errors[0].title).toEqual(dummyResponse.errors[0].title);
          expect(response.errors[0].detail).toEqual(dummyResponse.errors[0].detail);
        },
        () => fail('onCompleted has been called')
      );

      const queryRequest = httpMock.expectOne(expectedUrl);
      queryRequest.flush(dummyResponse, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should generate correct query string for array params with findAll', () => {
      const expectedQueryString = 'arrayParam[]=4&arrayParam[]=5&arrayParam[]=6';
      const expectedUrl = encodeURI(`${BASE_URL}/${API_VERSION}/books?${expectedQueryString}`);

      datastore.findAll(Book, { arrayParam: [4, 5, 6] }).subscribe();

      const findAllRequest = httpMock.expectOne(expectedUrl);
      findAllRequest.flush({ data: [] });
    });

    it('should generate correct query string for array params with query', () => {
      const expectedQueryString = 'arrayParam[]=4&arrayParam[]=5&arrayParam[]=6';
      const expectedUrl = encodeURI(`${BASE_URL}/${API_VERSION}/books?${expectedQueryString}`);

      datastore.query(Book, { arrayParam: [4, 5, 6] }).subscribe();

      const queryRequest = httpMock.expectOne(expectedUrl);
      queryRequest.flush({ data: [] });
    });

    it('should generate correct query string for nested params with findAll', () => {
      const expectedQueryString = 'filter[text]=test123';
      const expectedUrl = encodeURI(`${BASE_URL}/${API_VERSION}/books?${expectedQueryString}`);

      datastore.findAll(Book, { filter: { text: 'test123' } }).subscribe();

      const findAllRequest = httpMock.expectOne(expectedUrl);
      findAllRequest.flush({ data: [] });
    });

    it('should generate correct query string for nested array params with findAll', () => {
      const expectedQueryString = 'filter[text][]=1&filter[text][]=2';
      const expectedUrl = encodeURI(`${BASE_URL}/${API_VERSION}/books?${expectedQueryString}`);

      datastore.findAll(Book, { filter: { text: [1, 2] } }).subscribe();

      const findAllRequest = httpMock.expectOne(expectedUrl);
      findAllRequest.flush({ data: [] });
    });
  });

  describe('findRecord', () => {
    it('should get author', () => {
      const expectedUrl = `${BASE_URL}/${API_VERSION}/authors/${AUTHOR_ID}`;

      datastore.findRecord(Author, AUTHOR_ID).subscribe((author) => {
        expect(author).toBeDefined();
        expect(author.id).toBe(AUTHOR_ID);
        expect(author.date_of_birth).toEqual(parse(AUTHOR_BIRTH));
      });

      const findRecordRequest = httpMock.expectOne(expectedUrl);
      findRecordRequest.flush({ data: getAuthorData() });
    });

    it('should generate correct query string for array params with findRecord', () => {
      const expectedQueryString = 'arrayParam[]=4&arrayParam[]=5&arrayParam[]=6';
      const expectedUrl = encodeURI(`${BASE_URL}/${API_VERSION}/books/1?${expectedQueryString}`);

      datastore.findRecord(Book, '1', { arrayParam: [4, 5, 6] }).subscribe();

      const findRecordRequest = httpMock.expectOne(expectedUrl);
      findRecordRequest.flush({ data: getAuthorData() });
    });
  });

  describe('saveRecord', () => {
    it('should create new author', () => {
      const expectedUrl = `${BASE_URL}/${API_VERSION}/authors`;
      const author = datastore.createRecord(Author, {
        name: AUTHOR_NAME,
        date_of_birth: AUTHOR_BIRTH
      });

      author.save().subscribe((val) => {
        expect(val.id).toBeDefined();
        expect(val.id).toEqual(AUTHOR_ID);
      });

      httpMock.expectNone(`${BASE_URL}/${API_VERSION}`);
      const saveRequest = httpMock.expectOne({ method: 'POST', url: expectedUrl });
      const obj = saveRequest.request.body.data;
      expect(obj.attributes).toBeDefined();
      expect(obj.attributes.name).toEqual(AUTHOR_NAME);
      expect(obj.attributes.dob).toEqual(format(parse(AUTHOR_BIRTH), 'YYYY-MM-DDTHH:mm:ssZ'));
      expect(obj.id).toBeUndefined();
      expect(obj.type).toBe('authors');
      expect(obj.relationships).toBeUndefined();

      saveRequest.flush({
        data: {
          id: AUTHOR_ID,
          type: 'authors',
          attributes: {
            name: AUTHOR_NAME,
          }
        }
      }, { status: 201, statusText: 'Created' });
    });

    it('should throw error on new author with 201 response but no body', () => {
      const expectedUrl = `${BASE_URL}/${API_VERSION}/authors`;
      const author = datastore.createRecord(Author, {
        name: AUTHOR_NAME
      });

      author.save().subscribe(
        () => fail('should throw error'),
        (error) => expect(error).toEqual(new Error('no body in response'))
      );

      const saveRequest = httpMock.expectOne({ method: 'POST', url: expectedUrl });
      saveRequest.flush(null, { status: 201, statusText: 'Created' });
    });

    it('should throw error on new author with 201 response but no data', () => {
      const expectedUrl = `${BASE_URL}/${API_VERSION}/authors`;
      const author = datastore.createRecord(Author, {
        name: AUTHOR_NAME
      });

      author.save().subscribe(
        () => fail('should throw error'),
        (error) => expect(error).toEqual(new Error('expected data in response'))
      );

      const saveRequest = httpMock.expectOne({ method: 'POST', url: expectedUrl });
      saveRequest.flush({}, { status: 201, statusText: 'Created' });
    });

    it('should create new author with 204 response', () => {
      const expectedUrl = `${BASE_URL}/${API_VERSION}/authors`;
      const author = datastore.createRecord(Author, {
        name: AUTHOR_NAME
      });

      author.save().subscribe((val) => {
        expect(val).toBeDefined();
      });

      const saveRequest = httpMock.expectOne({ method: 'POST', url: expectedUrl });
      saveRequest.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('should create new author with existing ToMany-relationship', () => {
      const expectedUrl = `${BASE_URL}/${API_VERSION}/authors`;
      const author = datastore.createRecord(Author, {
        name: AUTHOR_NAME
      });
      author.books = [new Book(datastore, {
        id: '10',
        title: BOOK_TITLE
      })];

      author.save().subscribe();

      const saveRequest = httpMock.expectOne(expectedUrl);
      const obj = saveRequest.request.body.data;
      expect(obj.attributes.name).toEqual(AUTHOR_NAME);
      expect(obj.id).toBeUndefined();
      expect(obj.type).toBe('authors');
      expect(obj.relationships).toBeDefined();
      expect(obj.relationships.books.data.length).toBe(1);
      expect(obj.relationships.books.data[0].id).toBe('10');

      saveRequest.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('should create new author with new ToMany-relationship', () => {
      const expectedUrl = `${BASE_URL}/${API_VERSION}/authors`;
      const author = datastore.createRecord(Author, {
        name: AUTHOR_NAME
      });
      author.books = [datastore.createRecord(Book, {
        title: BOOK_TITLE
      })];

      author.save().subscribe();

      const saveRequest = httpMock.expectOne(expectedUrl);
      const obj = saveRequest.request.body.data;
      expect(obj.attributes.name).toEqual(AUTHOR_NAME);
      expect(obj.id).toBeUndefined();
      expect(obj.type).toBe('authors');
      expect(obj.relationships).toBeDefined();
      expect(obj.relationships.books.data.length).toBe(0);

      saveRequest.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('should create new author with new ToMany-relationship 2', () => {
      const expectedUrl = `${BASE_URL}/${API_VERSION}/authors`;
      const author = datastore.createRecord(Author, {
        name: AUTHOR_NAME
      });
      author.books = [datastore.createRecord(Book, {
        id: 123,
        title: BOOK_TITLE
      }), datastore.createRecord(Book, {
        title: `New book - ${BOOK_TITLE}`
      })];

      author.save().subscribe();

      const saveRequest = httpMock.expectOne(expectedUrl);
      const obj = saveRequest.request.body.data;
      expect(obj.id).toBeUndefined();
      expect(obj.relationships).toBeDefined();
      expect(obj.relationships.books.data.length).toBe(1);

      saveRequest.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('should create new book with existing BelongsTo-relationship', () => {
      const expectedUrl = `${BASE_URL}/${API_VERSION}/books`;
      const book = datastore.createRecord(Book, {
        title: BOOK_TITLE
      });
      book.author = new Author(datastore, {
        id: AUTHOR_ID
      });

      book.save().subscribe();

      const saveRequest = httpMock.expectOne(expectedUrl);
      const obj = saveRequest.request.body.data;
      expect(obj.attributes.title).toEqual(BOOK_TITLE);
      expect(obj.id).toBeUndefined();
      expect(obj.type).toBe('books');
      expect(obj.relationships).toBeDefined();
      expect(obj.relationships.author.data.id).toBe(AUTHOR_ID);

      saveRequest.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  describe('updateRecord', () => {
    it('should update author with 200 response (no data)', () => {
      const expectedUrl = `${BASE_URL}/${API_VERSION}/authors/${AUTHOR_ID}`;
      const author = new Author(datastore, {
        id: AUTHOR_ID,
        attributes: {
          date_of_birth: parse(AUTHOR_BIRTH),
          name: AUTHOR_NAME
        }
      });
      author.name = 'Rowling';
      author.date_of_birth = parse('1965-07-31');

      author.save().subscribe((val) => {
        expect(val.name).toEqual(author.name);
      });

      httpMock.expectNone(`${BASE_URL}/${API_VERSION}/authors`);
      const saveRequest = httpMock.expectOne({ method: 'PATCH', url: expectedUrl });
      const obj = saveRequest.request.body.data;
      expect(obj.attributes.name).toEqual('Rowling');
      expect(obj.attributes.dob).toEqual(format(parse('1965-07-31'), 'YYYY-MM-DDTHH:mm:ssZ'));
      expect(obj.id).toBe(AUTHOR_ID);
      expect(obj.type).toBe('authors');
      expect(obj.relationships).toBeUndefined();

      saveRequest.flush({});
    });

    it('should update author with 204 response', () => {
      const expectedUrl = `${BASE_URL}/${API_VERSION}/authors/${AUTHOR_ID}`;
      const author = new Author(datastore, {
        id: AUTHOR_ID,
        attributes: {
          date_of_birth: parse(AUTHOR_BIRTH),
          name: AUTHOR_NAME
        }
      });
      author.name = 'Rowling';
      author.date_of_birth = parse('1965-07-31');

      author.save().subscribe((val) => {
        expect(val.name).toEqual(author.name);
      });

      httpMock.expectNone(`${BASE_URL}/${API_VERSION}/authors`);
      const saveRequest = httpMock.expectOne({ method: 'PATCH', url: expectedUrl });
      const obj = saveRequest.request.body.data;
      expect(obj.attributes.name).toEqual('Rowling');
      expect(obj.attributes.dob).toEqual(format(parse('1965-07-31'), 'YYYY-MM-DDTHH:mm:ssZ'));
      expect(obj.id).toBe(AUTHOR_ID);
      expect(obj.type).toBe('authors');
      expect(obj.relationships).toBeUndefined();

      saveRequest.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('should integrate server updates on 200 response', () => {
      const expectedUrl = `${BASE_URL}/${API_VERSION}/authors/${AUTHOR_ID}`;
      const author = new Author(datastore, {
        id: AUTHOR_ID,
        attributes: {
          date_of_birth: parse(AUTHOR_BIRTH),
          name: AUTHOR_NAME
        }
      });
      author.name = 'Rowling';
      author.date_of_birth = parse('1965-07-31');

      author.save().subscribe((val) => {
        expect(val.name).toEqual('Potter');
      });

      httpMock.expectNone(`${BASE_URL}/${API_VERSION}/authors`);
      const saveRequest = httpMock.expectOne({ method: 'PATCH', url: expectedUrl });
      const obj = saveRequest.request.body.data;
      expect(obj.attributes.name).toEqual('Rowling');
      expect(obj.attributes.dob).toEqual(format(parse('1965-07-31'), 'YYYY-MM-DDTHH:mm:ssZ'));
      expect(obj.id).toBe(AUTHOR_ID);
      expect(obj.type).toBe('authors');
      expect(obj.relationships).toBeUndefined();

      saveRequest.flush({
        data: {
          id: obj.id,
          attributes: {
            name: 'Potter',
          }
        }
      });
    });
  });
});
