/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.publication.configuration;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * <p></p>
 * Created on 06/08/18
 *
 * @author David Binder
 */
@Configuration
@Profile("test")
public class TestConsumerConfig {

    static final String GROUP_EXCHANGE_NAME = "GroupExchange";
    static final String USER_EXCHANGE_NAME = "UserExchange";

    @Bean
    Queue groupQueue(){
        return QueueBuilder.nonDurable().autoDelete().build();
    }

    @Bean
    Queue userQueue(){return QueueBuilder.nonDurable().autoDelete().build();}

    @Bean
    Binding groupBinding1(Queue groupQueue, TopicExchange groupExchange) {
        return BindingBuilder.bind(groupQueue).to(groupExchange).with("#.mytso.#");
    }
    @Bean
    Binding groupBinding2(Queue groupQueue, TopicExchange groupExchange) {
        return BindingBuilder.bind(groupQueue).to(groupExchange).with("#.admin.#");
    }

    @Bean
    Binding userBinding(Queue userQueue, DirectExchange userExchange) {
        return BindingBuilder.bind(userQueue).to(userExchange).with("eric");
    }
}
