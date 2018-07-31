export interface PropertyConverter {
    mask(value: any): any;
    unmask(value: any): any;
}
