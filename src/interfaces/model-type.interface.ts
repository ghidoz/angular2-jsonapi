export interface ModelType<T> {
  new(...args: any[]): T;
}
