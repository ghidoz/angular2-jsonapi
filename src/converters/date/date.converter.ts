import * as dateFormat from 'date-fns/format';
import * as dateParse from 'date-fns/parse';
import { PropertyConverter } from '../../interfaces/property-converter.interface';

export class DateConverter implements PropertyConverter {
  mask(value: any) {
    return dateParse(value);
  }

  unmask(value: any) {
    return dateFormat(value, 'YYYY-MM-DDTHH:mm:ss[Z]');
  }
}
