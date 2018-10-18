/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.registry;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

import javax.annotation.PostConstruct;

@EnableEurekaServer
@SpringBootApplication
@Slf4j
public class Application {
//    @Value("#{eureka.client.serviceUrl.defaultZone}")
//    private String defaultZone;

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

//    @PostConstruct
//    public void display(){
//        log.info("DEFAULT_ZONE: "+defaultZone);
//    }
}
