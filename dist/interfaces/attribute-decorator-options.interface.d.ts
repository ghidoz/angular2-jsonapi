import { PropertyConverter } from './property-converter.interface';
export interface AttributeDecoratorOptions {
    serializedName?: string;
    converter?: PropertyConverter;
}
