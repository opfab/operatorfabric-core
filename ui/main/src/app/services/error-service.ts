import { AppError } from 'app/common/error/app-error';
import { NotAllowedError } from 'app/common/error/not-allowed-error';
import { NotFoundError } from 'app/common/error/not-found-error';
import { throwError } from 'rxjs';

export class ErrorService {

  protected handleError(error: Response) {
    if (error.status === 404) {
      return throwError(new NotFoundError(error));
    }
    if (error.status === 403) {
      return throwError(new NotAllowedError(error));
    }
    return throwError(new AppError(error));
  }

}
