/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.businessconfig.controllers;

import lombok.extern.slf4j.Slf4j;
import org.opfab.springtools.OpfabCustomExceptionHandler;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

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
 */
@RestControllerAdvice
@Slf4j
public class CustomExceptionHandler extends OpfabCustomExceptionHandler {

  /**
   * Handles {@link IOException} as 404 errors
   * @param exception exception to handle
   * @param request Corresponding request of exchange
   * @return Computed http response for specified exception
   */
  @ExceptionHandler(IOException.class)
  public ResponseEntity<Object> handleIOException(IOException exception, final WebRequest request) {
    log.warn(GENERIC_MSG, request, exception);
    ApiError error = ApiError.builder()
       .status(HttpStatus.BAD_REQUEST)
       .message("Unable to load resource with specified request parameters")
       .error(exception.getMessage())
       .build();
    return new ResponseEntity<>(error, error.getStatus());
  }

  /**
   * Handles {@link FileNotFoundException} as 404 errors
   * @param exception exception to handle
   * @param request Corresponding request of exchange
   * @return Computed http response for specified exception
   */
  @ExceptionHandler(FileNotFoundException.class)
  public ResponseEntity<Object> handleFileNotFoundException(FileNotFoundException exception, final WebRequest
     request) {
    log.info(GENERIC_MSG, request, exception);
    ApiError error = ApiError.builder()
       .status(HttpStatus.NOT_FOUND)
       .message("The specified resource does not exist")
       .error(exception.getMessage())
       .build();
    return new ResponseEntity<>(error, error.getStatus());
  }

}
