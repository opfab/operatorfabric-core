/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.config.server.EnableConfigServer;

import java.io.IOException;

@EnableConfigServer
@EnableDiscoveryClient
@SpringBootApplication
@Slf4j
public class Application {

    public static void main(String[] args) throws IOException {
        SpringApplication.run(Application.class, args);
    }

//    @Value("${spring.cloud.config.server.native.search-locations}")
//    String searchPath;
//
//    @PostConstruct
//    public void costConstruct() throws IOException {
//        log.info("CONFIG PATH is :"+searchPath);
//        Path path = Paths.get(searchPath);
//        if(Files.exists(path)) {
//            log.info("CONFIG PATH CONTAINS:");
//            Files.list(path).forEach(p -> log.info(p.toString()));
//        }else{
//            log.warn("CONFIG PATH DOES NOT EXIST");
//        }
//
//    }
}