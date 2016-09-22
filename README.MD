# Angular 2 JSON API

A lightweight Angular 2 adapter for [JSON API](http://jsonapi.org/)

[![Angular 2 Style Guide](https://mgechev.github.io/angular2-style-guide/images/badge.svg)](https://angular.io/styleguide) [![Dependency Status](https://david-dm.org/ghidoz/angular2-jsonapi.svg)](https://david-dm.org/ghidoz/angular2-jsonapi) [![devDependency Status](https://david-dm.org/ghidoz/angular2-jsonapi/dev-status.svg)](https://david-dm.org/ghidoz/angular2-jsonapi#info=devDependencies) [![npm version](https://badge.fury.io/js/angular2-jsonapi.svg)](https://badge.fury.io/js/angular2-jsonapi)

## Table of Contents
- [Introduction](#Introduction)
- [Installation](#installation)
- [Usage](#usage)
    - [Configuration](#configuration)
    - [Finding Records](#finding-records)
        - [Querying for Multiple Records](#querying-for-multiple-records)
        - [Retrieving a Single Record](#retrieving-a-single-record)
    - [Creating, Updating and Deleting](#creating-updating-and-deleting)
        - [Creating Records](#creating-records)
        - [Updating Records](#updating-records)
        - [Persisting Records](#persisting-records)
    - [Relationships](#relationships)
    - [Custom Headers](#custom-headers)
- [TODO](#todo)
- [Development](#development)
- [License](#licence)

## Introduction
Why this library? Because [JSON API](http://jsonapi.org/) is an awesome standard, but the responses that you get and the way to interact with endpoints are not really easy and directly consumable from Angular.

Moreover, using Angular2 and Typescript, we like to interact with classes and models, not with bare JSONs. Thanks to this library, you will be able to map all your data into models and relationships like these:

```javascript
[
    Post{
        id: 1,
        title: 'My post',
        content: 'My content',
        comments: [
            Comment{
                id: 1,
                // ...
            },
            Comment{
                id: 2,
                // ...
            }
        ]
    },
    // ...
]
```


## Installation

To install this library, run:
```bash
$ npm install angular2-jsonapi --save
```

Add the `JsonApiModule` to your app module imports:
```typescript
import { JsonApiModule } from 'angular2-jsonapi';

@NgModule({
  imports: [
    BrowserModule,
    JsonApiModule
  ],
  declarations: [
    AppComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

**Note**: Because in our custom `Datastore` service we will make use of dependency injection into a class that inherits from a class of this module (see [this doc for an example](https://angular.io/docs/ts/latest/cookbook/dependency-injection.html#!#di-inheritance)) the used `@angular/http` module in our base project need to be of the same version as the version used by this module. Otherwise you will get an error like this:
```
Argument of type 'Http' is not assignable to parameter of type 'Http'.
  Property '_backend' is protected but type 'Http' is not a class derived from 'Http'.
```
See [this issue](https://github.com/ghidoz/angular2-jsonapi/issues/4) for details.

## Usage

### Configuration

Firstly, create your `Datastore` service:
- Extend the `JsonApiDatastore` class
- Decorate it with `@JsonApiDatastoreConfig`, set the `baseUrl` for your APIs and map your models
- Pass the `Http` depencency to the parent constructor.

```typescript
import { JsonApiDatastoreConfig, JsonApiDatastore } from 'angular2-jsonapi';

@Injectable()
@JsonApiDatastoreConfig({
  baseUrl: 'http://localhost:8000/v1/',
  models: {
    posts: Post,
    comments: Comment,
    users: User
  }
})
export class Datastore extends JsonApiDatastore {

    constructor(http: Http) {
        super(http);
    }

}
```

Then set up your models:
- Extend the `JsonApiModel` class
- Decorate it with `@JsonApiModelConfig`, passing the `type`
- Decorate the class properties with `@Attribute`
- Decorate the relationships attributes with `@HasMany` and `@BelongsTo`

```typescript
import { JsonApiModelConfig, JsonApiModel, Attribute, HasMany, BelongsTo } from 'angular2-jsonapi';

@JsonApiModelConfig({
    type: 'posts'
})
export class Post extends JsonApiModel {

	@Attribute()
    title: string;

	@Attribute()
    content: string;

    @HasMany()
    comments: Comment[];
}

@JsonApiModelConfig({
    type: 'comments'
})
export class Comment extends JsonApiModel {

	@Attribute()
    title: string;

    @BelongsTo()
    post: Post;

	@BelongsTo()
    user: User;
}

@JsonApiModelConfig({
    type: 'users'
})
export class User extends JsonApiModel {

	@Attribute()
    name: string;
    // ...
}
```

### Finding Records

#### Querying for Multiple Records

Now, you can use your `Datastore` in order to query your API with the `query()` method:
- The first argument is the type of object you want to query.
- The second argument is the list of params: write them in JSON format and they will be serialized.

```typescript
// ...
constructor(private datastore: Datastore) { }

getPosts(){
    this.datastore.query(Post, {
        page: { size: 10, number: 1}
    }).subscribe(
        (posts: Post[]) => console.log(posts)
    );
}
```

Use `peekAll()` to retrieve all of the records for a given type that are already loaded into the store, without making a network request:

```typescript
let posts = this.datastore.peekAll(Post);
```


#### Retrieving a Single Record

Use `findRecord()` to retrieve a record by its type and ID:

```typescript
this.datastore.findRecord(Post, '1').subscribe(
    (post: Post) => console.log(post)
);
```

Use `peekRecord()` to retrieve a record by its type and ID, without making a network request. This will return the record only if it is already present in the store:

```typescript
let post = this.datastore.peekRecord(Post, '1');
```

### Creating, Updating and Deleting

#### Creating Records

You can create records by calling the `createRecord()` method on the datastore:
- The first argument is the type of object you want to create.
- The second is a JSON with the object attributes.

```typescript
this.datastore.createRecord(Post, {
    title: 'My post',
    content: 'My content'
});
```

#### Updating Records

Making changes to records is as simple as setting the attribute you want to change:

```typescript
this.datastore.findRecord(Post, '1').subscribe(
    (post: Post) => {
		post.title = 'New title';
	}
);
```

#### Persisting Records

Records are persisted on a per-instance basis. Call `save()` on any instance of `JsonApiModel` and it will make a network request.

The library takes care of tracking the state of each record for you, so that newly created records are treated differently from existing records when saving.

Newly created records will be `POST`ed:

```typescript
let post = this.datastore.createRecord(Post, {
    title: 'My post',
    content: 'My content'
});

post.save().subscribe();  // => POST to '/posts'
```

Records that already exist on the backend are updated using the HTTP `PATCH` verb:

```typescript
this.datastore.findRecord(Post, '1').subscribe(
    (post: Post) => {
		post.title = 'New title';
		post.save().subscribe();  // => PATCH to '/posts/1'
	}
);
```

The `save()` method will return an `Observer` that you can subscribe:

```typescript
post.save().subscribe(
    (post: Post) => console.log(post)
);
```

**Note**: always remember to call the `subscribe()` method, even if you are not interested in doing something with the response. Since the `http` method return a [cold Observable](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/gettingstarted/creating.md#cold-vs-hot-observables), the request won't go out until something subscribes to the observable.

You can tell if a record has outstanding changes that have not yet been saved by checking its `hasDirtyAttributes` property.

At this point, you can either persist your changes via `save()` or you can roll back your changes. Calling `rollbackAttributes()` for a saved record reverts all the dirty attributes to their original value.

```typescript
this.datastore.findRecord(Post, '1').subscribe(
    (post: Post) => {
        console.log(post.title);                // => 'Old title'
        console.log(post.hasDirtyAttributes);   // => false
		post.title = 'New title';
        console.log(post.hasDirtyAttributes);   // => true
		post.rollbackAttributes();
        console.log(post.hasDirtyAttributes);   // => false
        console.log(post.title);                // => 'Old title'
	}
);
```


### Relationships

#### Querying records

In order to query an object including its relationships, you can pass in its options the attribute name you want to load with the relationships:

```typescript
this.datastore.query(Post, {
    page: { size: 10, number: 1},
    include: 'comments'
}).subscribe(
    (posts: Post[]) => console.log(posts)
);
```

The same, if you want to include relationships when finding a record:

```typescript
this.datastore.findRecord(Post, '1', {
    include: 'comments,comments.user'
}).subscribe(
    (post: Post) => console.log(post)
);
```

The library will try to resolve relationships on infinite levels connecting nested objects by reference. So that you can have a `Post`, with a list of `Comment`s, that have a `User` that has `Post`s, that have `Comment`s... etc.

#### Creating Records

If the object you want to create has a **one-to-many** relationship, you can do this:

```typescript
let post = this.datastore.peekRecord(Post, '1');
let comment = this.datastore.createRecord(Comment, {
    title: 'My comment',
    post: post
});
comment.save().subscribe();
```

The library will do its best to discover which relationships map to one another. In the code above, for example, setting the `comment` relationship with the `post` will update the `post.comments` array, automatically adding the `comment` object!

If you want to include a relationship when creating a record to have it parsed in the response, you can pass the `params` object to the `save()` method:

```typescript
comment.save({
	include: 'user'
}).subscribe(
    (comment: Comment) => console.log(comment)
);
```

#### Updating Records

You can also update an object that comes from a relationship:

```typescript
this.datastore.findRecord(Post, '1', {
    include: 'comments'
}).subscribe(
    (post: Post) => {
        let comment: Comment = post.comments[0];
        comment.title = 'Cool';
        comment.save().subscribe((comment: Comment) => {
            console.log(comment);
        });
    }
);
```

### Custom Headers

By default, the library adds these headers, according to the [JSON API MIME Types](http://jsonapi.org/#mime-types):

```
Accept: application/vnd.api+json
Content-Type: application/vnd.api+json
```

You can also add your custom headers to be appended to each http call:

```typescript
this.datastore.headers = new Headers({'Authorization': 'Bearer ' + accessToken});
```

Or you can pass the headers as last argument of any datastore call method:

```typescript
this.datastore.query(Post, {
    include: 'comments'
}, new Headers({'Authorization': 'Bearer ' + accessToken}));
```

and in the `save()` method:

```typescript
post.save({}, new Headers({'Authorization': 'Bearer ' + accessToken})).subscribe();
```


## TODO
- [ ] Deleting records 
- [ ] Conversion to and from `Date` property
- [ ] Handling validation errors
- [ ] Updating or removing a relationship
- [ ] [Explicit inverses](https://guides.emberjs.com/v2.8.0/models/relationships/#toc_explicit-inverses)
- [ ] Loading an object's relationships
- [ ] Unit testing
- [ ] Setting a specific baseUrl for each model


## Development

To generate all `*.js`, `*.js.map` and `*.d.ts` files:

```bash
$ npm run tsc
```

To lint all `*.ts` files:

```bash
$ npm run lint
```

## Thanks

This library is inspired by the draft of [this never implemented library](https://github.com/beauby/angular2-jsonapi).

## License

MIT © [Daniele Ghidoli](http://danieleghidoli.it)
