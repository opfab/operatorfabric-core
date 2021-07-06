/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.springtools.configuration.oauth;

import org.opfab.utilities.AmqpUtils;
import org.springframework.amqp.core.AcknowledgeMode;
import org.springframework.amqp.core.AmqpAdmin;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.rabbit.listener.MessageListenerContainer;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;

/* 
* <p>Listens to USER_CONFIG_CHANGE queue to clear user cache for a given user.</p>
*/
public class UpdateUserListener {
    
    private String userQueueName;
    private AmqpAdmin amqpAdmin;
    private ConnectionFactory connectionFactory;
    private MessageListenerContainer eventListener;
    private UserServiceCache userServiceCache;

    public UpdateUserListener( AmqpAdmin amqpAdmin, FanoutExchange userExchange,ConnectionFactory connectionFactory,      
    String appName, UserServiceCache userServiceCache, int retries, long retryInterval) {
        this.amqpAdmin = amqpAdmin;
        this.connectionFactory = connectionFactory;
        this.userServiceCache = userServiceCache;
        this.userQueueName = appName + ".users";
        AmqpUtils.createQueue(amqpAdmin, userQueueName, userExchange, retries, retryInterval);
        this.eventListener = createMessageListenerContainer(userQueueName);
        registerUserListener(eventListener);
        eventListener.start();
    }

    /**
     * Create a {@link MessageListenerContainer} for the specified queue
     * @param queueName AMQP queue name
     * @return listener container for the specified queue
     */
    public MessageListenerContainer createMessageListenerContainer(String queueName) {

        SimpleMessageListenerContainer mlc = new SimpleMessageListenerContainer(connectionFactory);
        mlc.addQueueNames(queueName);
        mlc.setAcknowledgeMode(AcknowledgeMode.AUTO);
        return mlc;
    }

    private void registerUserListener(MessageListenerContainer mlc) {
        mlc.setupMessageListener(message -> {
            String userLogin = new String(message.getBody());
            userServiceCache.clearUserCache(userLogin);
        });
    }

    /**
     * Stops associated {@link MessageListenerContainer} and delete queues
     */
    public void clearSubscription() {
        eventListener.stop();
        amqpAdmin.deleteQueue(userQueueName);
    }
}
