/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.services;

import jakarta.annotation.PreDestroy;

import org.opfab.utilities.AmqpUtils;
import org.springframework.amqp.core.AmqpAdmin;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class RabbitMQEntryPoint {

    private static final String CARD_QUEUE_NAME = "card";
    private static final String PROCESS_QUEUE_NAME = "process";
    private static final String USER_QUEUE_NAME = "user";
    private static final String ACK_QUEUE_NAME = "ack";

    @Value("${operatorfabric.amqp.connectionRetries:30}")
    private int retries;

    @Value("${operatorfabric.amqp.connectionRetryInterval:5000}")
    private long retryInterval;

    private AmqpAdmin amqpAdmin;
    private FanoutExchange cardExchange;
    private FanoutExchange processExchange;
    private FanoutExchange userExchange;
    private FanoutExchange ackExchange;
    private ConnectionFactory connectionFactory;
    private CardSubscriptionService cardSubscriptionService;

    private SimpleMessageListenerContainer cardListener;
    private SimpleMessageListenerContainer userListener;
    private SimpleMessageListenerContainer processListener;
    private SimpleMessageListenerContainer ackListener;



    public RabbitMQEntryPoint(AmqpAdmin amqpAdmin,
            FanoutExchange cardExchange,
            FanoutExchange processExchange,
            FanoutExchange userExchange,
            FanoutExchange ackExchange,
            ConnectionFactory connectionFactory,
            CardSubscriptionService cardSubscriptionService) {
        this.amqpAdmin = amqpAdmin;
        this.cardExchange = cardExchange;
        this.processExchange = processExchange;
        this.userExchange = userExchange;
        this.ackExchange = ackExchange;
        this.connectionFactory = connectionFactory;
        this.cardSubscriptionService = cardSubscriptionService;

        log.info("Starting rabbitMQ queues");
        createQueues();

    }

    private void createQueues() {
        AmqpUtils.createQueue(amqpAdmin, CARD_QUEUE_NAME, cardExchange, retries, retryInterval);
        AmqpUtils.createQueue(amqpAdmin, PROCESS_QUEUE_NAME, processExchange, retries, retryInterval);
        AmqpUtils.createQueue(amqpAdmin, USER_QUEUE_NAME, userExchange, retries, retryInterval);
        AmqpUtils.createQueue(amqpAdmin, ACK_QUEUE_NAME, ackExchange, retries, retryInterval);
        cardListener = startListener(CARD_QUEUE_NAME);
        userListener = startListener(USER_QUEUE_NAME);
        processListener = startListener(PROCESS_QUEUE_NAME);
        ackListener = startListener(ACK_QUEUE_NAME);
    }

    private SimpleMessageListenerContainer startListener(String queueName) {
        SimpleMessageListenerContainer mlc = new SimpleMessageListenerContainer(connectionFactory);
        mlc.addQueueNames(queueName);
        mlc.setAcknowledgeMode(AcknowledgeMode.AUTO);
        mlc.setupMessageListener(
                message -> cardSubscriptionService.onMessage(queueName, new String(message.getBody())));
        mlc.start();
        return mlc;
    }

    @PreDestroy
    public void destroy() {
        
        cardListener.stop();
        userListener.stop();
        processListener.stop();
        ackListener.stop();

        // we just stop the listener but 
        // we do not delete queue via amqpAdmin.deleteQueue(...)
        // as we want to keep the message received while the service is down 

        log.debug("******* Rabbit Listener stopped ");

    }
}
