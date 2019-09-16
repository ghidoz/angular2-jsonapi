export interface JsonApiError {
  id?: string;
  links?: Array<any>;
  status?: string;
  code?: string;
  title?: string;
  detail?: string;
  source?: {
    pointer?: string;
    parameter?: string
  };
  meta?: any;
}

export class ErrorResponse {
  errors?: JsonApiError[] = [];

  constructor(errors ?: JsonApiError[]) {
    if (errors) {
      this.errors = errors;
    }
  }
}
