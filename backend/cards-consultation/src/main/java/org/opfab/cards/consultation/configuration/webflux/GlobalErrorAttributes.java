/* Copyright (c) 2018-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.configuration.webflux;

import org.opfab.error.model.ApiError;
import org.opfab.error.model.ApiErrorException;
import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.webflux.error.DefaultErrorAttributes;
import org.springframework.boot.webflux.error.ErrorAttributes;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;

import java.util.Map;

/**
 * <p>
 * Implementation of {@link ErrorAttributes}
 * </p>
 * <p>
 * In addition to the attribute exposed by {@link DefaultErrorAttributes}, sets
 * status and message according
 * to {@link ApiError} if underlying exception is instance of
 * {@link ApiErrorException}
 * </p>
 */
@Component
public class GlobalErrorAttributes extends DefaultErrorAttributes {

    public GlobalErrorAttributes() {
        super();
    }

    @Override
    public Map<String, Object> getErrorAttributes(ServerRequest request, ErrorAttributeOptions options) {
        Map<String, Object> map = super.getErrorAttributes(request, options);

        Throwable originThrowable = getError(request);
        map.put("origin", originThrowable);
        if (originThrowable instanceof ApiErrorException apiErrorException) {
            map.put("status", apiErrorException.getError().getStatus());
            map.put("message", apiErrorException.getError().getMessage());
        }
        return map;
    }

}
