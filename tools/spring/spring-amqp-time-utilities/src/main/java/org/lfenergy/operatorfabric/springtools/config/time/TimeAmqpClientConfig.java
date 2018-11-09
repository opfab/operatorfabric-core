/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.springtools.config.time;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configures time client
 *
 * @author David Binder
 */
@Configuration
@Slf4j
public class TimeAmqpClientConfig {

    final static String exchangeName = "timeExchange";

    /**
     * Durable auto delete queue
     * @return Time queue
     */
    @Bean
    Queue timeQueue(){
        return QueueBuilder.durable().autoDelete().build();
    }

    /**
     * Fanout exchange
     * @return time exchange
     */
    @Bean
    FanoutExchange timeExchange(){
        return (FanoutExchange) ExchangeBuilder.fanoutExchange(exchangeName).build();
    }

    /**
     * standard Fannout binding
     * @param timeQueue configured time queue
     * @param timeExchange configures time exchange
     * @return exchange/queue binding
     */
    @Bean
    Binding timeDataBinding(Queue timeQueue, FanoutExchange timeExchange){
        return BindingBuilder.bind(timeQueue).to(timeExchange);
    }

    /**
     * TimeReceiver instance configure with object mapper to read json time message
     * @param objectMapper json object mapper
     * @return time receiver
     */
    @Bean
    TimeReceiver timeReceiver(ObjectMapper objectMapper){
        log.info("Now listening for time data");
        return new TimeReceiver(objectMapper);
    }

}
