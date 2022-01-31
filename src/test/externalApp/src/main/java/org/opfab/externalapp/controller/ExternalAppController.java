
/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externalapp.controller;

import com.fasterxml.jackson.databind.JsonNode;
import org.opfab.externalapp.service.ExternalAppServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;


@RestController
public class ExternalAppController {

    private ExternalAppServiceImpl externalAppServiceImpl;

    @Autowired
    public ExternalAppController(ExternalAppServiceImpl externalAppServiceImpl) {
        this.externalAppServiceImpl = externalAppServiceImpl;
    }

    @PostMapping("/test")
    @ResponseStatus(HttpStatus.OK)
    public void externalAppResponse(@RequestBody Optional<JsonNode> requestBody)  {
        if (requestBody.isEmpty())
            throw new IllegalArgumentException("No Request Body");

        externalAppServiceImpl.receiveCard(requestBody);
    }

    @DeleteMapping("/test/{id}")
    @ResponseStatus(HttpStatus.OK)
    public void onCardSuppression(@PathVariable String id)  {
        externalAppServiceImpl.deleteCard(id);
    }

    @GetMapping("/")
    public String home() {
        return   externalAppServiceImpl.welcomeMessage();
    }
}
