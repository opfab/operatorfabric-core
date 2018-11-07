/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.consultation.config.webflux;

import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.springframework.boot.web.reactive.error.DefaultErrorAttributes;
import org.springframework.boot.web.reactive.error.ErrorAttributes;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;

import java.util.Map;

/**
 * <p>Implementation of {@link ErrorAttributes}</p>
 * <p>In addition to the attribute exposed bu {@link DefaultErrorAttributes}, sets status and message according
 * to {@link org.lfenergy.operatorfabric.springtools.error.model.ApiError} if underlying exception is instance of
 * {@link ApiErrorException}
 * ></p>
 * @author David Binder
 */
@Component
public class GlobalErrorAttributes extends DefaultErrorAttributes {

    public GlobalErrorAttributes() {
        super(true);
    }

    @Override
    public Map<String, Object> getErrorAttributes(ServerRequest request, boolean includeStackTrace) {
        Map<String, Object> map = super.getErrorAttributes(request, includeStackTrace);
        Throwable error = (Throwable) map.get("exception");
        if(error instanceof ApiErrorException) {
            map.put("status", ((ApiErrorException)error).getError().getStatus());
            map.put("message", ((ApiErrorException)error).getError().getMessage());
        }
        return map;
    }

}
