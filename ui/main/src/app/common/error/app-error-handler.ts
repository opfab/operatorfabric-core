import { ErrorHandler } from '@angular/core';
import { NotAllowedError } from './not-allowed-error';
import { NotFoundError } from './not-found-error';

export class AppErrorHandler implements ErrorHandler {

  handleError(error) {
    if (error instanceof NotAllowedError) {
      alert('Action not allowed');
    }
    if (error instanceof NotFoundError) {
      alert('Resource not found');
    }

    console.log(error);
  }
}
