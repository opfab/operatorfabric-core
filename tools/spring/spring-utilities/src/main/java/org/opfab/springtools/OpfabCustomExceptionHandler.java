/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.springtools;

import lombok.extern.slf4j.Slf4j;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * OpfabCustomExceptionHandler.
 * <ul>
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
public class OpfabCustomExceptionHandler extends ResponseEntityExceptionHandler {

    public static final String GENERIC_MSG = "Caught exception at API level for request {}";

    /**
     * Handles {@link ApiErrorException}
     * @param exception exception to handle
     * @param request Corresponding request of exchange
     * @return Computed http response for specified exception
     */
    @ExceptionHandler(ApiErrorException.class)
    public ResponseEntity<Object> handleApiError(ApiErrorException exception, final WebRequest
            request) {

        log.info(GENERIC_MSG + " {}", request, exception.getError().getMessage());
        return new ResponseEntity<>(exception.getError(), exception.getError().getStatus());
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        log.error("Uncaught internal server exception",ex);
        return super.handleExceptionInternal(ex, body, headers, status, request);
    }
}

