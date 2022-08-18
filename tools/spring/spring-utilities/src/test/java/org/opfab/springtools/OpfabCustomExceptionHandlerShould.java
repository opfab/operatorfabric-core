/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.springtools;

import org.junit.jupiter.api.Test;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.springframework.http.ResponseEntity;


import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

class OpfabCustomExceptionHandlerShould {

    private OpfabCustomExceptionHandler handler = new OpfabCustomExceptionHandler();

    @Test
    void handleApiErrorException(){
        ApiErrorException aee = new ApiErrorException(
                ApiError.builder().status(INTERNAL_SERVER_ERROR).error("api error message").build(),
                "api error test",
                null);
        ResponseEntity<Object> result = handler.handleApiError(aee, null);
        assertThat(((ApiError)result.getBody()).getErrors()).contains("api error message");
    }

}
