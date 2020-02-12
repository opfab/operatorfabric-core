/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.time.configuration;

import org.springframework.amqp.core.ExchangeBuilder;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * AMQP exchange configuration
 *
 *
 */
@Configuration
public class AmqpConfig {

    static final String EXCHANGE_NAME = "timeExchange";

    /**
     * Instantiate the exchange used to transfer time information
     * @return time fanout exchange
     */
    @Bean
    public FanoutExchange timeExchange(){
        return (FanoutExchange) ExchangeBuilder.fanoutExchange(EXCHANGE_NAME).build();
    }
}
