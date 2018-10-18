/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.config.amqp;

import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.ExchangeBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * <p></p>
 * Created on 29/06/18
 *
 * @author davibind
 */
@Configuration
public class AmqpConfig {

    static final String GROUP_EXCHANGE_NAME = "GroupExchange";
    static final String USER_EXCHANGE_NAME = "UserExchange";

    @Bean
    public TopicExchange groupExchange(){
        return (TopicExchange) ExchangeBuilder.topicExchange(GROUP_EXCHANGE_NAME).build();
    }

    @Bean
    public DirectExchange userExchange(){
        return (DirectExchange) ExchangeBuilder.directExchange(USER_EXCHANGE_NAME).build();
    }
}
