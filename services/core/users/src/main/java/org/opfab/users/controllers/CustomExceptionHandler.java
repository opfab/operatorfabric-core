/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.users.controllers;

import feign.FeignException;
import lombok.extern.slf4j.Slf4j;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.springframework.core.convert.ConversionFailedException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * CustomExceptionHandler.
 * <ul>
 *     <li>Handle {@link DuplicateKeyException} as 400 BAD REQUEST errors</li>
 *     <li>Handle Api errors according to their configuration</li>
 *     <li>Handle uncaught logging errors</li>
 * </ul>
 *
 * @see ApiError
 * @see ApiErrorException
 *
 */
@RestControllerAdvice
@Slf4j
public class CustomExceptionHandler extends ResponseEntityExceptionHandler {

  public static final String GENERIC_MSG = "Caught exception at API level";

  /**
   * Handles {@link ApiErrorException}
   * @param exception exception to handle
   * @param request Corresponding request of exchange
   * @return Computed http response for specified exception
   */
  @ExceptionHandler(ApiErrorException.class)
  public ResponseEntity<Object> handleApiError(ApiErrorException exception, final WebRequest
     request) {
    log.info(GENERIC_MSG + " : " + exception.getError().getMessage());
    return new ResponseEntity<>(exception.getError(), exception.getError().getStatus());
  }

  /**
   * Handles {@link DuplicateKeyException} as 400 BAD_REQUEST error
   * @param exception exception to handle
   * @return Computed http response for specified exception
   */
  @ExceptionHandler(DuplicateKeyException.class)
  public ResponseEntity<Object> handleDuplicateKey(DuplicateKeyException exception, final WebRequest
          request) {
    log.error(GENERIC_MSG,exception);
    ApiError error = ApiError.builder()
            .status(HttpStatus.BAD_REQUEST)
            .message("Resource creation failed because a resource with the same key already exists.")
            .error(exception.getMessage())
            .build();
    return new ResponseEntity<>(error, error.getStatus());
  }

  /**
   * Handles {@link FeignException} as 400 BAD_REQUEST error
   * @param exception exception to handle
   * @return Computed http response for specified exception
   */
  @ExceptionHandler(FeignException.class)
  public ResponseEntity<Object> handleFeignException(FeignException exception, final WebRequest
          request) {
    log.error(GENERIC_MSG,exception);
    ApiError error = ApiError.builder()
            .status(HttpStatus.BAD_REQUEST)
            .message("Action failed because users privileges couldn't be retrieved from the Users service.")
            .error(exception.getMessage())
            .build();
    return new ResponseEntity<>(error, error.getStatus());
  }

  @Override
  protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body, HttpHeaders headers, HttpStatus status, WebRequest request) {
    log.error("Uncaught internal server exception",ex);
    return super.handleExceptionInternal(ex, body, headers, status, request);
  }

    /**
   * Handles {@link ConversionFailedException} as 400 BAD_REQUEST error
   * @param exception exception to handle
   * @return Computed http response for specified exception
   */
  @ExceptionHandler(ConversionFailedException.class)
  public ResponseEntity<Object> handleConversionError(ConversionFailedException exception, final WebRequest
          request) {
    log.error(GENERIC_MSG,exception);
    ApiError error = ApiError.builder()
            .status(HttpStatus.BAD_REQUEST)
            .message("Conversion Error")
            .error(exception.getMessage())
            .build();
    return new ResponseEntity<>(error, error.getStatus());
  }
}
