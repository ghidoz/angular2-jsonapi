import { JsonModelConverter } from './json-model.converter';
import { School } from '../../../test/models/school.model';

describe('JsonModel converter', () => {
  let converter: JsonModelConverter<any>;

  describe('mask method', () => {

    describe('ArrayModel - simple values', () => {
      beforeEach(() => {
        converter = new JsonModelConverter(Array, { hasMany: true });
      });

      it('should return empty array when empty input', () => {
        const result = converter.mask(null);
        expect(result instanceof Array).toBeTruthy();
      });

      it('should return the empty array when provided empty array', () => {
        const DATA: Array<any> = [];
        expect(converter.mask(DATA)).toEqual(DATA);
      });

      it('should return the array with data when provided default value', () => {
        const DATA: Array<number> = [1, 2, 3];
        expect(converter.mask(DATA)).toEqual(DATA);
      });

      it('should filter-out null values from array', () => {
        const DATA: Array<number | null> = [1, 2, null, 3];
        const result = converter.mask(DATA);
        expect(result.length).toBe(3);
        expect(result).not.toContain(null);
      });
    });

    describe('ArrayModel - simple values - nullable', () => {
      beforeEach(() => {
        converter = new JsonModelConverter(Array, { hasMany: true, nullValue: true });
      });

      it('should throw error when provided empty array when empty input', () => {
        const VALUE = null;
        expect(() => {
          converter.mask(VALUE);
        }).toThrow(new Error('ERROR: JsonModelConverter: Expected array but got ' + typeof VALUE + '.'));
      });
    });

    describe('Array model -> object values', () => {

      beforeEach(() => {
        converter = new JsonModelConverter(School, { hasMany: true });
      });

      it('should return array of Schools from provided data', () => {
        const DATA: Array<any> = [
          { name: 'Massachusetts Institute of Technology', students: 11319, foundation: '1861-10-04' },
          { name: 'Charles University', students: 51438, foundation: '1348-04-07' },
        ];
        const result = converter.mask(DATA);
        expect(result.length).toBe(2);
        expect(result[0]).toEqual(new School(DATA[0]));
        expect(result[1]).toEqual(new School(DATA[1]));
      });
    });

    describe('ObjectModel', () => {
      beforeEach(() => {
        converter = new JsonModelConverter(School);
      });

      it('should return new School when provided without value', () => {
        const result = converter.mask(null);
        expect(result instanceof School).toBeTruthy();
      });

      it('should not create new instance when already provided School instance', () => {
        const DATA = new School({
          name: 'Massachusetts Institute of Technology',
          students: 11319,
          foundation: '1861-10-04'
        });
        const result = converter.mask(DATA);
        expect(result).toEqual(DATA);
      });

      it('should instance of School with data when provided initial data', () => {
        const DATA = { name: 'Massachusetts Institute of Technology', students: 11319, foundation: '1861-10-04' };
        const result: School = converter.mask(DATA);
        expect(result.name).toBeTruthy(DATA.name);
        expect(result.students).toBeTruthy(DATA.students);
        expect(result.foundation).toBeTruthy(new Date(DATA.foundation));
      });
    });

    describe('ObjectModel - nullable', () => {
      beforeEach(() => {
        converter = new JsonModelConverter(School, { nullValue: false });
      });

      it('should return null when null', () => {
        const result = converter.mask(null);
        expect(result instanceof School).toBeTruthy();
      });
    });
  });

  describe('unmask method', () => {
    describe('ArrayModel - simple values', () => {
      beforeEach(() => {
        converter = new JsonModelConverter(Array, { hasMany: true });
      });

      it('should return serialized output when provided null', () => {
        const result = converter.unmask(null);
        expect(result).toBeNull();
      });

      it('should return serialized array of strings', () => {
        const DATA: Array<any> = ['a', 'b', 'c'];
        expect(converter.unmask(DATA)).toEqual(DATA);
      });

      it('should filter-out null values from array', () => {
        const DATA: Array<number | null> = [1, 2, null, 3];
        const result = converter.unmask(DATA);
        expect(result.length).toBe(3);
        expect(result).not.toContain(null);
      });
    });

    describe('Array model -> object values', () => {

      beforeEach(() => {
        converter = new JsonModelConverter(School, { hasMany: true });
      });

      it('should return serialized Schools from provided Array of Schools', () => {
        const DATA: Array<any> = [
          { name: 'Massachusetts Institute of Technology', students: 11319, foundation: '1861-10-04' },
          { name: 'Charles University', students: 51438, foundation: '1348-04-07' },
        ];
        const schools: Array<School> = [new School(DATA[0]), new School(DATA[1])];
        const result: Array<any> = converter.unmask(schools);
        expect(result.length).toBe(2);
        for (const key in result) {
          expect(result[key].name).toBe(DATA[key].name);
          expect(result[key].students).toBe(DATA[key].students);
          expect(result[key].foundation).toContain(DATA[key].foundation);
        }
      });
    });

    describe('ObjectModel - nullable', () => {
      beforeEach(() => {
        converter = new JsonModelConverter(School, { nullValue: false });
      });

      it('should return null when null', () => {
        const result = converter.unmask(null);
        expect(result).toEqual(null);
      });

      it('should return serialized school when provided School instance', () => {
        const DATA = { name: 'Massachusetts Institute of Technology', students: 11319, foundation: '1861-10-04' };
        const result = converter.unmask(new School(DATA));
        expect(result.name).toBe(DATA.name);
        expect(result.students).toBe(DATA.students);
        expect(result.foundation).toContain(DATA.foundation);
      });
    });
  });
});
