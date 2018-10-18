/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.controllers;

import org.springframework.boot.web.reactive.error.DefaultErrorAttributes;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;

import java.util.Map;

/**
 * <p></p>
 * Created on 09/10/18
 *
 * @author davibind
 */
@Component
public class GlobalErrorAttributes extends DefaultErrorAttributes {

    private HttpStatus status = HttpStatus.BAD_REQUEST;
    private String message = "please provide a name";

    public GlobalErrorAttributes() {
        super(false);
    }

    @Override
    public Map<String, Object> getErrorAttributes(ServerRequest request, boolean includeStackTrace) {
        Map<String, Object> map = super.getErrorAttributes(request, includeStackTrace);
        map.put("status", getStatus());
        map.put("message", getMessage());
        return map;
    }

    /**
     * @return the status
     */
    public HttpStatus getStatus() {
        return status;
    }

    /**
     * @param status the status to set
     */
    public void setStatus(HttpStatus status) {
        this.status = status;
    }

    /**
     * @return the message
     */
    public String getMessage() {
        return message;
    }

    /**
     * @param message the message to set
     */
    public void setMessage(String message) {
        this.message = message;
    }
}
