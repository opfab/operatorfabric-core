/* Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ErrorHandler} from '@angular/core';
import {NotAllowedError} from './not-allowed-error';
import {NotFoundError} from './not-found-error';

/** Declaring an `ErrorHandler` allows error handling to be centralized.
 * By default, it will print messages to the console, and this class is a custom `ErrorHandler` that will override
 * this default for certain error types.
 */
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
