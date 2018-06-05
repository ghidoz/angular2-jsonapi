
### Bug fixes

  * Fix serializedName in included relationships ([#174](https://github.com/ghidoz/angular2-jsonapi/issues/174))

# [5.0.0] (2018-11-04)

### BREAKING CHANGES

  * Replace HttpModule with HttpClientModule

# [4.1.0] (2018-03-01)

### Bug fixes

  * Fix creating nested models passed through included property

# [4.0.3] (2018-01-16)

### Features

* Update peer dependencies to support Angular v5

# [4.0.2] (2017-11-06)

### Bug fixes

* Fix date timezone
* Fix falsy attributes mapping
* Tweak methods visibility

# [4.0.1] (2017-11-06)

### Bug fixes

* Fix updating has many relationships after saving a model

# [4.0.0] (2017-11-03)

### BREAKING CHANGES

- Update to Angular 4

### Features

- Update Attribute decorator with custom property converter ([88d8d30](https://github.com/ghidoz/angular2-jsonapi/commit/88d8d3070928ca57cd7d02c82784363d46eccdb7))
- Make JsonApiModelMeta more customizable ([b678bb7](https://github.com/ghidoz/angular2-jsonapi/commit/b678bb7d2125e15a275d2768927feeede3fb933b))
- Add support for overriding internal methods ([f15be33](https://github.com/ghidoz/angular2-jsonapi/commit/f15be33890c8c444f05862faa6f63ec2422bb0c1))
- Add support for custom endpoint URLs ([9b43f12](https://github.com/ghidoz/angular2-jsonapi/commit/9b43f12ee25bd4b23e8c1603f34efb7cb8d201c2))

### Bug fixes

- Fix serializing query parameters ([cc58b73](cc58b739b867ae0f403f9e3b85026dd5c4122749))
- Remove attributes from relationship objects ([5f1a3fc](https://github.com/ghidoz/angular2-jsonapi/commit/5f1a3fcda0dcc95b2f3fbbf771893c7e2b868dd1))
- Fix saving model metadata ([cbf26d7](https://github.com/ghidoz/angular2-jsonapi/commit/cbf26d7dad07bc7d9788c45a61e60de914c8ee10))

# [3.4.0](https://github.com/ghidoz/angular2-jsonapi/compare/v3.3.0...v3.4.0) (2016-12-17)

### Bug Fixes
- Make library AOT ready and remove conflicting reflect-metadata import ([#13](https://github.com/ghidoz/angular2-jsonapi/issues/13)) ([#35](https://github.com/ghidoz/angular2-jsonapi/issues/35)) ([8186f8b](https://github.com/ghidoz/angular2-jsonapi/commit/8186f8b))

### Features
- Ability to work with dates as Date objects ([76c652b](https://github.com/ghidoz/angular2-jsonapi/commit/76c652b))
- Throw a better error when a relationship is not mapped ([d135e58](https://github.com/ghidoz/angular2-jsonapi/commit/d135e58))

# [3.3.0](https://github.com/ghidoz/angular2-jsonapi/compare/v3.2.1...v3.3.0) (2016-11-01)

### Bug Fixes
- Override accept/content-type headers instead of adding ([#39](https://github.com/ghidoz/angular2-jsonapi/issues/39)) ([5c1f984](https://github.com/ghidoz/angular2-jsonapi/commit/5c1f984))
- Remove "hard" dependencies to @angular packages and introduce peerDependencies ([#46](https://github.com/ghidoz/angular2-jsonapi/issues/46)) ([6efe0f8](https://github.com/ghidoz/angular2-jsonapi/commit/6efe0f8))

### Features
- Support error objects from JSON API specification ([d41ecb9](https://github.com/ghidoz/angular2-jsonapi/commit/d41ecb9))

# [3.2.1](https://github.com/ghidoz/angular2-jsonapi/compare/v3.2.0...v3.2.1) (2016-10-13)

### Bug Fixes
- Move some types under devDependencies ([#35](https://github.com/ghidoz/angular2-jsonapi/issues/35)) ([b20df04](https://github.com/ghidoz/angular2-jsonapi/commit/b20df04))
- Add typings index in package.json ([#36](https://github.com/ghidoz/angular2-jsonapi/issues/36)) ([e5446e6](https://github.com/ghidoz/angular2-jsonapi/commit/e5446e6))

# [3.2.0](https://github.com/ghidoz/angular2-jsonapi/compare/v3.1.1...v3.2.0) (2016-10-12)

### Bug Fixes
- Add existence check on belongs to parsing ([3f538a0](https://github.com/ghidoz/angular2-jsonapi/commit/3f538a0))
- Removed dependency on typings ([#22](https://github.com/ghidoz/angular2-jsonapi/issues/22)) ([cec0a6a](https://github.com/ghidoz/angular2-jsonapi/commit/cec0a6a))
- Fix optional relationship on BelongsTo and HasMany ([764631c](https://github.com/ghidoz/angular2-jsonapi/commit/764631c))

### Features
- Add delete record method ([#28](https://github.com/ghidoz/angular2-jsonapi/issues/28)) ([2f6c380](https://github.com/ghidoz/angular2-jsonapi/commit/2f6c380))
- Make parameters and return values of JsonApiDatastore generic ([4120437](https://github.com/ghidoz/angular2-jsonapi/commit/4120437))

# [3.1.1](https://github.com/ghidoz/angular2-jsonapi/compare/v3.1.0...v3.1.1) (2016-09-22)

### Bug Fixes
- Fix one-to-one relationship ([21ebac8](https://github.com/ghidoz/angular2-jsonapi/commit/21ebac8))
- Add check on data length parsing the HasMany relationship ([#14](https://github.com/ghidoz/angular2-jsonapi/issues/14)) ([0b9ac31](https://github.com/ghidoz/angular2-jsonapi/commit/0b9ac31))

# [3.1.0](https://github.com/ghidoz/angular2-jsonapi/compare/v3.0.0...v3.1.0) (2016-09-22)

### Bug Fixes
- Do not delete relationship from object when saving a model ([8751d3f](https://github.com/ghidoz/angular2-jsonapi/commit/8751d3f))

### Features
- Allow overriding of JsonApiDatastore's error handler in derived classes ([98a300b](https://github.com/ghidoz/angular2-jsonapi/commit/98a300b))
- Parse infinite levels of relationships by reference ([bd02e3a](https://github.com/ghidoz/angular2-jsonapi/commit/bd02e3a))
- Push object to hasMany relationship array when updating object relationship ([99d082a](https://github.com/ghidoz/angular2-jsonapi/commit/99d082a))

# [3.0.0](https://github.com/ghidoz/angular2-jsonapi/compare/v2.1.0...v3.0.0) (2016-09-18)

### Features
- Implement persistence and save() method ([46aa23f](https://github.com/ghidoz/angular2-jsonapi/commit/46aa23f))
- Add peekRecord and peekAll, caching records in the store ([43de815](https://github.com/ghidoz/angular2-jsonapi/commit/43de815))
- Implement PATCH method ([#9](https://github.com/ghidoz/angular2-jsonapi/issues/9))  ([4b47443](https://github.com/ghidoz/angular2-jsonapi/commit/4b47443))
- Add Attribute decorator and tracking of attributes changes + save only dirty attributes ([fe20b8b](https://github.com/ghidoz/angular2-jsonapi/commit/fe20b8b))
- Add hasDirtyAttributes property to model ([a38fa1c](https://github.com/ghidoz/angular2-jsonapi/commit/a38fa1c))
- Add rollbackAttributes() method to model ([fc377fb](https://github.com/ghidoz/angular2-jsonapi/commit/fc377fb))
- Upgrade to Angular 2.0.0 final version ([3c30cdd](https://github.com/ghidoz/angular2-jsonapi/commit/3c30cdd))

### BREAKING CHANGES
- It's mandatory decorate each models' property with the `Attribute()` decorator
- The `createRecord()` method does not call the API anymore, it just creates the object. In order to save the object on the server, you need to call the `save()` method on the model.
- Since this library uses to the `Http` service of the Angular 2.0.0 final, you should use this Angular version in your project.

# [2.1.0](https://github.com/ghidoz/angular2-jsonapi/compare/v2.0.0...v2.1.0) (2016-09-16)

### Bug Fixes
- Enable nested relationships sync ([#7](https://github.com/ghidoz/angular2-jsonapi/issues/7)) (8b7b662)

# [2.0.0](https://github.com/ghidoz/angular2-jsonapi/compare/v1.2.1...v2.0.0) (2016-09-02)

### Bug Fixes
- Allow Http service to be injected in JsonApiDatastore ([#4](https://github.com/ghidoz/angular2-jsonapi/issues/4)) ([1e567c5](https://github.com/ghidoz/angular2-jsonapi/commit/1e567c5))

### Features
- Upgrade to Angular RC6 ([4b02c8a](https://github.com/ghidoz/angular2-jsonapi/commit/4b02c8a))
- Implement NgModule ([410b3b2](https://github.com/ghidoz/angular2-jsonapi/commit/410b3b2))

### BREAKING CHANGES
- Since this library uses to the `Http` service of the Angular RC6, you should use this Angular version in your project.
- Instead of adding `PROVIDERS` to bootstrap dependencies, import the new `JsonApiModule` in the main module

# [1.2.1](https://github.com/ghidoz/angular2-jsonapi/compare/v1.2.0...v1.2.1) (2016-08-30)

### Bug Fixes
- Fix: id should be a string ([#5](https://github.com/ghidoz/angular2-jsonapi/issues/5)) ([72b7fb0](https://github.com/ghidoz/angular2-jsonapi/commit/72b7fb0))

# [1.2.0](https://github.com/ghidoz/angular2-jsonapi/compare/v1.1.0...v1.2.0) (2016-08-26)

### Bug Fixes
- Use a string for include field instead of the class name ([e7f7b7f](https://github.com/ghidoz/angular2-jsonapi/commit/e7f7b7f))

### Features
- Add BelongsTo relationship ([edfc2af](https://github.com/ghidoz/angular2-jsonapi/commit/edfc2af))

### BREAKING CHANGES
- You cannot use the class name anymore when including the relationship. You should use the field name as a string.

# [1.1.0](https://github.com/ghidoz/angular2-jsonapi/compare/v1.0.0...v1.1.0) (2016-08-25)

### Features
- Can set global custom headers and headers for each call ([#2](https://github.com/ghidoz/angular2-jsonapi/issues/2)) ([bef14f3](https://github.com/ghidoz/angular2-jsonapi/commit/bef14f3))

# 1.0.0 (2016-08-05)

### Features
- Add config and models decorators
- Add query method
- Add findRecord
- Add createRecord
- Add basic relationship parsing
