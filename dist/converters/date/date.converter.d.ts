import { PropertyConverter } from '../../interfaces/property-converter.interface';
export declare class DateConverter implements PropertyConverter {
    mask(value: any): Date;
    unmask(value: any): string;
}
