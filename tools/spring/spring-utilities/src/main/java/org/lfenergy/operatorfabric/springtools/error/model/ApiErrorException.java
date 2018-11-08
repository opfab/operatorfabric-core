/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.springtools.error.model;

import lombok.Getter;

/**
 * <p></p>
 * Created on 13/04/18
 *
 * @author davibind
 */
@Getter()
public class ApiErrorException extends Exception {
  private final ApiError error;

  public ApiErrorException(ApiError error, String message, Throwable cause) {
    super(message, cause);
    this.error = error;
  }

  public ApiErrorException(ApiError error, String message) {
    super(message);
    this.error = error;
  }

  public ApiErrorException(ApiError error, Throwable cause) {
    super(error.getMessage(), cause);
    this.error = error;
  }

  public ApiErrorException(ApiError error) {
    super(error.getMessage());
    this.error = error;
  }


}
