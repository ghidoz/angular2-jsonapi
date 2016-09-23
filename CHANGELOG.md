# [3.1.1](https://github.com/ghidoz/angular2-jsonapi/compare/v3.1.0...v3.1.1) (2016-09-22)

### Bug Fixes
- Fix one-to-one relationship (21ebac8)
- Add check on data length parsing the HasMany relationship (0b9ac31)

# [3.1.0](https://github.com/ghidoz/angular2-jsonapi/compare/v3.0.0...v3.1.0) (2016-09-22)

### Bug Fixes
- Do not delete relationship from object when saving a model (8751d3f)

### Features
- Allow overriding of JsonApiDatastore's error handler in derived classes (98a300b)
- Parse infinite levels of relationships by reference (bd02e3a)
- Push object to hasMany relationship array when updating object relationship (99d082a)

# [3.0.0](https://github.com/ghidoz/angular2-jsonapi/compare/v2.1.0...v3.0.0) (2016-09-18)

### Features
- Implement persistence and save() method (46aa23f)
- Add peekRecord and peekAll, caching records in the store (43de815)
- Implement PATCH method (4b47443)
- Add Attribute decorator and tracking of attributes changes + save only dirty attributes (fe20b8b)
- Add hasDirtyAttributes property to model (a38fa1c)
- Add rollbackAttributes() method to model (fc377fb)
- Upgrade to Angular 2.0.0 final version (3c30cdd)

### BREAKING CHANGES
- It's mandatory decorate each models' property with the `Attribute()` decorator
- The `createRecord()` method does not call the API anymore, it just creates the object. In order to save the object on the server, you need to call the `save()` method on the model.
- Since this library uses to the `Http` service of the Angular 2.0.0 final, you should use this Angular version in your project.

# [2.1.0](https://github.com/ghidoz/angular2-jsonapi/compare/v2.0.0...v2.1.0) (2016-09-16)

### Bug Fixes
- Enable nested relationships sync (#7) (8b7b662)

# [2.0.0](https://github.com/ghidoz/angular2-jsonapi/compare/v1.2.1...v2.0.0) (2016-09-02)

### Bug Fixes
- Allow Http service to be injected in JsonApiDatastore (#4) (1e567c5)

### Features
- Upgrade to Angular RC6 (4b02c8a)
- Implement NgModule (410b3b2)

### BREAKING CHANGES
- Since this library uses to the `Http` service of the Angular RC6, you should use this Angular version in your project.
- Instead of adding `PROVIDERS` to bootstrap dependencies, import the new `JsonApiModule` in the main module

# [1.2.1](https://github.com/ghidoz/angular2-jsonapi/compare/v1.2.0...v1.2.1) (2016-08-30)

### Bug Fixes
- Fix: id should be a string (#5) (72b7fb0)

# [1.2.0](https://github.com/ghidoz/angular2-jsonapi/compare/v1.1.0...v1.2.0) (2016-08-26)

### Bug Fixes
- Use a string for include field instead of the class name (e7f7b7f)

### Features
- Add BelongsTo relationship (edfc2af)

### BREAKING CHANGES
- You cannot use the class name anymore when including the relationship. You should use the field name as a string. 

# [1.1.0](https://github.com/ghidoz/angular2-jsonapi/compare/v1.0.0...v1.1.0) (2016-08-25)

### Features
- Can set global custom headers and headers for each call (#2) (bef14f3)

# 1.0.0 (2016-08-05)

### Features
- Add config and models decorators
- Add query method
- Add findRecord
- Add createRecord
- Add basic relationship parsing