/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.actions.configuration.feign;

import com.fasterxml.jackson.databind.ObjectMapper;
import feign.*;
import feign.jackson.JacksonDecoder;
import feign.jackson.JacksonEncoder;
import org.lfenergy.operatorfabric.actions.services.feign.CardConsultationServiceProxy;
import org.lfenergy.operatorfabric.actions.services.feign.ThirdsServiceProxy;
import org.lfenergy.operatorfabric.springtools.configuration.oauth.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.cloud.openfeign.support.SpringMvcContract;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
* Feign Proxy Configuration
 */
@Configuration
@EnableFeignClients
@EnableDiscoveryClient
public class ProxyConfig {

    @Autowired
    ObjectMapper objectMapper;

    @Bean
    public CardConsultationServiceProxy cardConsultationServiceProxy(Client client /*Encoder encoder, Decoder decoder, Contract contract,*/){
        return Feign.builder()
                .client(client)
                .encoder(new JacksonEncoder(objectMapper))
                .decoder(new JacksonDecoder(objectMapper))
                .contract(new SpringMvcContract())
                .requestInterceptor(new OAuth2FeignRequestInterceptor())
                .target(CardConsultationServiceProxy.class,"http://CARDS-CONSULTATION");

    }

    @Bean
    public ThirdsServiceProxy thirdsServiceProxy(Client client /*Encoder encoder, Decoder decoder, Contract contract,*/){
        return Feign.builder()
                .client(client)
                .encoder(new JacksonEncoder(objectMapper))
                .decoder(new JacksonDecoder(objectMapper))
                .contract(new SpringMvcContract())
                .requestInterceptor(new OAuth2FeignRequestInterceptor())
                .target(ThirdsServiceProxy.class,"http://THIRDS");

    }

}
