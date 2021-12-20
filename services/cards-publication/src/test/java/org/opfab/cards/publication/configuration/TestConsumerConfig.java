/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.publication.configuration;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * <p></p>
 * Created on 06/08/18
 *
 *
 */
@Configuration
@Profile("test")
public class TestConsumerConfig {

    @Bean
    Queue cardQueue(){
        return QueueBuilder.nonDurable().autoDelete().build();
    }

    @Bean
    Binding groupBinding(Queue cardQueue, FanoutExchange cardExchange) {
        return BindingBuilder.bind(cardQueue).to(cardExchange);
    }

}
