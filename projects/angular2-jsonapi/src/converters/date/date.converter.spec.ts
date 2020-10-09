import { DateConverter } from './date.converter';
import { parseISO } from 'date-fns';

describe('Date converter', () => {
  const converter: DateConverter = new DateConverter();

  describe('mask method', () => {

    it('Null stays null', () => {
        const value = converter.mask(null);
        expect(value).toBeNull();
    });

    it ( 'string is transformed to Date object', () => {
      const value = converter.mask('2019-11-11');
      expect(value instanceof Date).toBeTruthy();
    });

    it ( 'empty string is transformed to Date object', () => {
      const value = converter.mask('');
      expect(value instanceof Date).toBeTruthy();
    });
  });

  describe('unmask method', () => {

    it('Null stays null', () => {
        const value = converter.unmask(null);
        expect(value).toBeNull();
    });

    it ( 'Date to be transformed to string', () => {
      const value = converter.unmask(parseISO('2019-11-11'));
      expect(typeof value === 'string').toBeTruthy();
    });
  });

});
