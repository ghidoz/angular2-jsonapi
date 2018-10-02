import { JsonApiNestedModel, PropertyConverter } from '../..';

export class JsonModelConverter<T> implements PropertyConverter {
  private modelType: any; // ModelType<T>

  constructor(model: T, public nullValue: boolean = true) {
    this.modelType = model; // <ModelType<T>>model
  }

  mask(value: any): T {
    if (!value && !this.nullValue) {
      return new this.modelType();
    }

    let result = null;
    if (Array.isArray(value)) {
      result = [];
      for (const item of value) {
        if (item === null) {
          continue;
        }
        let temp;
        if (typeof item === 'object') {
          temp = new this.modelType();
          temp.fill(item);
        } else {
          temp = item;
        }

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
    if (!value) {
      return value;
    }
    let result = null;
    if (Array.isArray(value)) {
      result = [];
      for (const item of value) {
        if (!item) {
          continue;
        }
        if (item instanceof JsonApiNestedModel) {
          item.nestedDataSerialization = true;
          result.push(item.serialize());
          item.nestedDataSerialization = false;
        } else {
          result.push(item);
        }
      }
    } else {
      if (value instanceof JsonApiNestedModel) {
        value.nestedDataSerialization = true;
        result = value.serialize();
        value.nestedDataSerialization = false;
      } else {
        result = value;
      }
    }
    return result;
  }
}
