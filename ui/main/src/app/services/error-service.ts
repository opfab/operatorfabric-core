/* Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AppError} from 'app/common/error/app-error';
import {NotAllowedError} from 'app/common/error/not-allowed-error';
import {NotFoundError} from 'app/common/error/not-found-error';
import {throwError} from 'rxjs';

/** This class describes what errors should be thrown depending on the API `Response`
 * Services requiring this behaviour should extend this class (see `GroupService` for example).
 * Note: This can't be an interface because Typescript doesn't allow default methods.
 */
export abstract class ErrorService {

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
