import { parseISO } from 'date-fns';
import { PropertyConverter } from '../../interfaces/property-converter.interface';

export class DateConverter implements PropertyConverter {
  mask(value: any) {
    if (typeof value === 'string') {
      return parseISO(value);
    } else {
      return value;
    }
  }

  unmask(value: any) {
    return value.toISOString();
  }
}
