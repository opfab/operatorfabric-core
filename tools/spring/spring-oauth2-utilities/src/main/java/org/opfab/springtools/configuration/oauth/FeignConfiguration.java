/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.springtools.configuration.oauth;

import org.springframework.context.annotation.Bean;

import feign.codec.Decoder;
import feign.codec.Encoder;
import feign.jackson.JacksonDecoder;
import feign.jackson.JacksonEncoder;

/**
 * Common configuration (MVC and Webflux)
 *
 *
 */

public class FeignConfiguration {


    @Bean
    public Encoder jacksonEncoder() {
        return new JacksonEncoder();
    }

    @Bean
    public Decoder jacksonDecoder() {
        return new JacksonDecoder();
    }

}
