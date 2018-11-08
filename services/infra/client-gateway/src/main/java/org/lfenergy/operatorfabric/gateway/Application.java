/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.gateway;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * <p></p>
 * Created on 05/10/18
 *
 * @author davibind
 */
@SpringBootApplication
@EnableDiscoveryClient
@Slf4j
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

//    @Value("${spring.cloud.bootstrap.location}")
//    String bootstraploc;
//    @PostConstruct
//    public void init(){
//        log.info("BOOTSTRAP LOCATION: "+bootstraploc);
//    }
}
