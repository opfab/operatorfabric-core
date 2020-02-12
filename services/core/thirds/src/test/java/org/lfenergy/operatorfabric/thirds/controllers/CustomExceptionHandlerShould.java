/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.thirds.controllers;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.lfenergy.operatorfabric.thirds.application.IntegrationTestApplication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.FileNotFoundException;
import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

/**
 * <p></p>
 * Created on 18/06/18
 *
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {IntegrationTestApplication.class})
@Slf4j
@ActiveProfiles("test")
class CustomExceptionHandlerShould {

  @Autowired
  private CustomExceptionHandler handler;

  @Test
  public void handleIOException(){
    IOException ioe = new IOException("ioexception test");
    ResponseEntity<Object> result = handler.handleIOException(ioe, null);
    assertThat(((ApiError)result.getBody()).getErrors()).contains("ioexception test");
  }

  @Test
  public void handleFileNotFoundException(){
    FileNotFoundException fnfe = new FileNotFoundException("fileNotFound test");
    ResponseEntity<Object> result = handler.handleFileNotFoundException(fnfe, null);
    assertThat(((ApiError)result.getBody()).getErrors()).contains("fileNotFound test");
  }

  @Test
  public void handleApiErrorException(){
    ApiErrorException aee = new ApiErrorException(
       ApiError.builder().status(INTERNAL_SERVER_ERROR).error("api error message").build(),
       "api error test",
       null);
    ResponseEntity<Object> result = handler.handleApiError(aee, null);
    assertThat(((ApiError)result.getBody()).getErrors()).contains("api error message");
  }

}
