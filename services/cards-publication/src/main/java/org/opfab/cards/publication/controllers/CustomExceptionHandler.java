/* Copyright (c) 2021-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.controllers;

import org.opfab.springtools.OpfabCustomExceptionHandler;
import org.opfab.springtools.error.model.ApiError;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class CustomExceptionHandler extends OpfabCustomExceptionHandler {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CustomExceptionHandler.class);

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Object> handleConstraintViolationException(ConstraintViolationException exception,
            final WebRequest request) {
        log.info(GENERIC_MSG + ",  {}", request, exception.getMessage());
        ApiError error = new ApiError(HttpStatus.BAD_REQUEST, "Constraint violation in the request",
                exception.getMessage());
        return new ResponseEntity<>(error, error.getStatus());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDeniedException(AccessDeniedException exception,
            final WebRequest request) {
        log.warn(GENERIC_MSG + " , {} ", request, exception.getMessage());
        ApiError error = new ApiError(HttpStatus.FORBIDDEN, "Action unauthorized", exception.getMessage());
        return new ResponseEntity<>(error, error.getStatus());
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        log.error("Uncaught internal server exception", ex);
        ApiError error = new ApiError(status, "Uncaught internal server exception", ex.getMessage());

        return new ResponseEntity<>(error, error.getStatus());
    }
}
