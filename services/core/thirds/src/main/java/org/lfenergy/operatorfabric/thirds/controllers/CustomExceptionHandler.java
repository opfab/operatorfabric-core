package org.lfenergy.operatorfabric.thirds.controllers;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.io.FileNotFoundException;
import java.io.IOException;

/**
 * CustomExceptionHandler.
 * <ul>
 *     <li>Handle {@link IOException} and {@link FileNotFoundException} as 404 errors</li>
 *     <li>Handle Api errors according to their configuration</li>
 * </ul>
 *
 * @see ApiError
 * @see ApiErrorException
 *
 * @author David Binder
 */
@RestControllerAdvice
@Slf4j
public class CustomExceptionHandler extends ResponseEntityExceptionHandler {

  public static final String GENERIC_MSG = "Caught exception at API level";

  /**
   * Handle {@link IOException} as 404 errors
   * @param exception
   * @param request
   * @return
   */
  @ExceptionHandler(IOException.class)
  public ResponseEntity<Object> handleIOException(IOException exception, final WebRequest request) {
    log.warn(GENERIC_MSG,exception);
    ApiError error = ApiError.builder()
       .status(HttpStatus.BAD_REQUEST)
       .message("Unable to load resource with specified request parameters")
       .error(exception.getMessage())
       .build();
    return new ResponseEntity<>(error, error.getStatus());
  }

  /**
   * Handle {@link FileNotFoundException} as 404 errors
   * @param exception
   * @param request
   * @return
   */
  @ExceptionHandler(FileNotFoundException.class)
  public ResponseEntity<Object> handleFileNotFoundException(FileNotFoundException exception, final WebRequest
     request) {
    log.info(GENERIC_MSG,exception);
    ApiError error = ApiError.builder()
       .status(HttpStatus.NOT_FOUND)
       .message("The specified resource does not exist")
       .error(exception.getMessage())
       .build();
    return new ResponseEntity<>(error, error.getStatus());
  }

  /**
   * Handle {@link ApiErrorException}
   * @param exception
   * @param request
   * @return
   */
  @ExceptionHandler(ApiErrorException.class)
  public ResponseEntity<Object> handleApiError(ApiErrorException exception, final WebRequest
     request) {
    log.info(GENERIC_MSG,exception);
    return new ResponseEntity<>(exception.getError(), exception.getError().getStatus());
  }

}