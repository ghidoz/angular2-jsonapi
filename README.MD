# Angular 2 JSON API

A lightweight Angular 2 adapter for [JSON API](http://jsonapi.org/)

[![Angular 2 Style Guide](https://mgechev.github.io/angular2-style-guide/images/badge.svg)](https://angular.io/styleguide) [![Dependency Status](https://david-dm.org/ghidoz/angular2-jsonapi.svg)](https://david-dm.org/ghidoz/angular2-jsonapi) [![devDependency Status](https://david-dm.org/ghidoz/angular2-jsonapi/dev-status.svg)](https://david-dm.org/ghidoz/angular2-jsonapi#info=devDependencies) [![npm version](https://badge.fury.io/js/angular2-jsonapi.svg)](https://badge.fury.io/js/angular2-jsonapi)

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [TODO](#todo)
- [Development](#development)
- [License](#licence)


## Installation

To install this library, run:
```bash
$ npm install angular2-jsonapi --save
```

If you use [Angular-CLI](https://github.com/angular/angular-cli), add the package to `system-config.ts`:
```typescript
const map: any = {
  'angular2-jsonapi': 'vendor/angular2-jsonapi/dist'
};

const packages: any = {
  'angular2-jsonapi': {defaultExtension: 'js', main: 'index.js'}
};
```

and to `angular-cli-build.js`:
```javascript
vendorNpmFiles: [
    // ...
    'angular2-jsonapi/dist/**/*.+(ts|js|js.map)'
]
```

Add the library's `PROVIDERS` to your bootstrap dependences:
```typescript
import { PROVIDERS } from 'angular2-jsonapi';

bootstrap(AppComponent, [
  PROVIDERS
]);
```

## Usage

Firstly, create your `Datastore` service, extending the `JsonApiDatastore`, and set the `url` for your APIs:

```typescript
import { Injectable } from '@angular/core';
import { JsonApiDatastore } from 'angular2-jsonapi';

@Injectable()
export class Datastore extends JsonApiDatastore {

    protected url = 'http://localhost:8000/v1/';

}
```

Then set up your models:
- Extend the `JsonApiModel` class
- Decorate it with `@JsonApiModelConfig`, passing the `type`
- Decorate the relationships attributes with `@HasMany`, passing the class itself as `type`

```typescript
import { JsonApiModel, HasMany,  JsonApiModelConfig} from 'angular2-jsonapi';

@JsonApiModelConfig({
    type: 'posts'
})
export class Post extends JsonApiModel {

    title: string;
    content: string;

    @HasMany({
        type: Comment
    })
    comments: Comment[];
}
```

Now, you can use your `Datastore`, in order to query your API:

```typescript
// ...
constructor(private datastore: Datastore) { }

getPosts(){
    this.datastore.query(Post, {
        page: { size: 10, number: 1},
        include: 'comments'
    }).subscribe(
        (posts: Post[]) => console.log(posts)
    )
}
```

You will get an array of objects where every mapped relationship will be automatically resolved:
```javascript
[
    Post{
        id: 1,
        title: 'My post',
        content: 'My content',
        comments: [
            Comment{/.../},
            Comment{/.../}
        ]
    }
    // ...
]
```

## TODO
- Implement everything from the [JSON API](http://jsonapi.org/) specific.
- Add unit testing and E2E testing


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

MIT © [Daniele Ghidoli](daniele.ghidoli@bigthink.it)
