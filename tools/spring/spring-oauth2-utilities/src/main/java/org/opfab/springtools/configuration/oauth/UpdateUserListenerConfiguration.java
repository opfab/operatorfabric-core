/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.springtools.configuration.oauth;

import org.springframework.amqp.core.AmqpAdmin;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class UpdateUserListenerConfiguration {

    @Value("${spring.application.name}")
    private String appName;

    @Autowired
    @Bean(destroyMethod = "clearSubscription")
    public UpdateUserListener initUpdateUserListener(AmqpAdmin amqpAdmin, FanoutExchange userExchange, ConnectionFactory connectionFactory, UserServiceCache userServiceCache) {
        return new UpdateUserListener(amqpAdmin, userExchange, connectionFactory, appName, userServiceCache);
    }
}


