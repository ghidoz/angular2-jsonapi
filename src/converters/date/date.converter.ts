import { format, parse } from 'date-fns';
import { PropertyConverter } from '../../interfaces/property-converter.interface';

export class DateConverter implements PropertyConverter {
  mask(value: any) {
    return parse(value);
  }

  unmask(value: any) {
    return format(value, 'YYYY-MM-DDTHH:mm:ss[Z]');
  }
}
