/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.springtools.configuration.oauth;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Feign proxy for Businessconfig service
 */
@FeignClient(url="${operatorfabric.servicesUrls.businessconfig}", name = "translation", configuration=FeignConfiguration.class)
public interface I18nProcessesProxy {

    @GetMapping(value = "/businessconfig/processes/{process}/translation",
            produces = { "application/json" })
            JsonNode getTranslation(@PathVariable(value="process") String process, @RequestParam("version") String version) ;
}