/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.controllers;

import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.useractiontracing.model.LastUserAction;
import org.opfab.useractiontracing.services.LastUserActionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.List;

@RestController
@RequestMapping("/lastUserAction")
public class LastUserActionController {

    private LastUserActionService lastUserActionService;

    public LastUserActionController(LastUserActionService lastUserActionService) {
        this.lastUserActionService = lastUserActionService;
    }

    @GetMapping(produces = { "application/json" })
    public List<LastUserAction> getLastUserAction(HttpServletRequest request, HttpServletResponse response) {
        return lastUserActionService.getLastUserAction();
    }

    @GetMapping(value = "/{login}", produces = { "application/json" })
    public LastUserAction fetchLastUserAction(HttpServletRequest request, HttpServletResponse response, @PathVariable("login") String login)
            throws ApiErrorException {
        LastUserAction lastUserAction = lastUserActionService.fetchLastUserAction(login);
        if (lastUserAction == null) {
            throw new ApiErrorException(
                    new ApiError(HttpStatus.NOT_FOUND, "Last user action not found for login: " + login));
        }
        return lastUserAction;
    }
}
