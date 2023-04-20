/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.controllers;

import lombok.extern.slf4j.Slf4j;
import org.opfab.springtools.OpfabCustomExceptionHandler;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import jakarta.validation.ConstraintViolationException;

/**
 * CustomExceptionHandler.
 * <ul>
 *     <li>Handle {@link ConstraintViolationException} as 400 BAD REQUEST errors</li>
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
public class CustomExceptionHandler extends OpfabCustomExceptionHandler {

    /**
     * Handles {@link ConstraintViolationException}
     * @param exception exception to handle
     * @param request Corresponding request of exchange
     * @return Computed http response for specified exception
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Object> handleConstraintViolationException(ConstraintViolationException exception, final WebRequest
            request) {
        log.info(GENERIC_MSG + ",  {}", request, exception.getMessage());
        ApiError error = ApiError.builder()
                .status(HttpStatus.BAD_REQUEST)
                .message("Constraint violation in the request")
                .error(exception.getMessage())
                .build();
        return new ResponseEntity<>(error, error.getStatus());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDeniedException(AccessDeniedException exception, final WebRequest
            request) {
        log.warn(GENERIC_MSG + " , {} ", request, exception.getMessage());
        ApiError error = ApiError.builder()
                .status(HttpStatus.FORBIDDEN)
                .message("Action unauthorized")
                .error(exception.getMessage())
                .build();
        return new ResponseEntity<>(error, error.getStatus());
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        log.error("Uncaught internal server exception", ex);

        ApiError error = ApiError.builder()
                .status(status)
                .message("Uncaught internal server exception")
                .error(ex.getMessage())
                .build();

        return new ResponseEntity<>(error, error.getStatus());
    }
}
