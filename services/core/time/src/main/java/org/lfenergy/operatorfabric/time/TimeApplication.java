/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.time;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.configuration.oauth.EnableOperatorFabricOAuth2;
import org.lfenergy.operatorfabric.time.services.feign.CardConsultationServiceProxy;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.ImportResource;
//import springfox.documentation.swagger2.annotations.EnableSwagger2;

@SpringBootApplication
//@EnableSwagger2
@Slf4j
@RefreshScope
@EnableFeignClients(basePackageClasses = CardConsultationServiceProxy.class)
@EnableDiscoveryClient
@EnableOperatorFabricOAuth2
public class TimeApplication {

    public static void main(String[] args) {
        CardConsultationServiceProxy.class.getPackage().getName();
        ConfigurableApplicationContext ctx = SpringApplication.run(TimeApplication.class, args);

        assert (ctx != null);
    }
}