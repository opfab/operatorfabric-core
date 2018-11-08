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
