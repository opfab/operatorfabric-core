/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.config.server.EnableConfigServer;
import org.springframework.context.annotation.ImportResource;

import java.io.IOException;

/**
 * Sets up a configuration with AMQP notification and registration in Eureka
 */
@EnableConfigServer
@EnableDiscoveryClient
@SpringBootApplication
@Slf4j
public class ConfigurationApplication {

    public static void main(String[] args) throws IOException {
        SpringApplication.run(ConfigurationApplication.class, args);
    }

}