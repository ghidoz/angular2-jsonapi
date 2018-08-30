import { PropertyConverter } from '../..';

export class JsonModelConverter<T> implements PropertyConverter {
  private modelType: any; // ModelType<T>

  constructor(model: T) {
    this.modelType = model; // <ModelType<T>>model
  }

  mask(value: any): T {
    if (!value) {
      return new this.modelType();
    }

    let result = null;
    if (Array.isArray(value)) {
      result = [];
      for (const item of value) {
        if (item === null) {
          continue;
        }
        const temp = new this.modelType();
        temp.fill(item);
        result.push(temp);
      }
    } else {
      if (!(value instanceof this.modelType)) {
        result = new this.modelType();
        result.fill(value);
      } else {
        result = value;
      }
    }
    return result;
  }

  unmask(value: any): any {
    let result = null;
    if (Array.isArray(value)) {
      result = [];
      for (const item of value) {
        result.push(item.serialize());
      }
    } else {
      result = value.serialize();
    }
    return result;
  }
}
