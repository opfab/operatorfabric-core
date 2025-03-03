/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.businessconfig.controllers;

import org.opfab.springtools.OpfabCustomExceptionHandler;
import org.opfab.springtools.error.model.ApiError;
import org.slf4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.io.FileNotFoundException;
import java.io.IOException;

@RestControllerAdvice
public class CustomExceptionHandler extends OpfabCustomExceptionHandler {

    private static final Logger log = org.slf4j.LoggerFactory.getLogger(CustomExceptionHandler.class);

    @ExceptionHandler(IOException.class)
    public ResponseEntity<Object> handleIOException(IOException exception, final WebRequest request) {
        log.warn(GENERIC_MSG, request, exception);
        ApiError error = new ApiError(HttpStatus.BAD_REQUEST,
                "Unable to load resource with specified request parameters",
                exception.getMessage());
        return new ResponseEntity<>(error, error.getStatus());
    }

    @ExceptionHandler(FileNotFoundException.class)
    public ResponseEntity<Object> handleFileNotFoundException(FileNotFoundException exception,
            final WebRequest request) {
        log.info(GENERIC_MSG, request, exception);
        ApiError error = new ApiError(HttpStatus.NOT_FOUND, "The specified resource does not exist",
                exception.getMessage());
        return new ResponseEntity<>(error, error.getStatus());
    }

}
