/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.utilities.eventbus.rabbit;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;

import org.springframework.stereotype.Service;
import org.opfab.utilities.eventbus.EventBus;
import org.opfab.utilities.eventbus.EventListener;
import org.springframework.beans.factory.annotation.Value;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.DeliverCallback;
import com.rabbitmq.client.ShutdownListener;
import com.rabbitmq.client.ShutdownSignalException;
import com.rabbitmq.client.BuiltinExchangeType;

import org.apache.commons.pool2.ObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPool;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class RabbitEventBus implements EventBus {

    @Value("${spring.application.name}")
    private String appName;

    @Value("${operatorfabric.rabbitmq.connectionRetries:30}")
    private int retries;

    @Value("${operatorfabric.rabbitmq.connectionRetryInterval:5000}")
    private long retryInterval;

    @Value("${operatorfabric.rabbitmq.host:localhost}")
    private String host;

    @Value("${operatorfabric.rabbitmq.port:5672}")
    private int port;

    @Value("${operatorfabric.rabbitmq.username:guest}")
    private String username;

    @Value("${operatorfabric.rabbitmq.password:guest}")
    private String password;

    private Channel channelForListening; // use to listen to events

    // A pool of channel is used to emit events
    // using a pool optimizes performance on heavy load (recommended on rabbitMQ
    // documentation)
    private ObjectPool<Channel> channelPool;

    private HashMap<String, RabbitListener> rabbitListeners = new HashMap<>();
    private HashSet<String> createdExchange = new HashSet<>();

    RabbitEventBus() {

    }

    @PostConstruct
    void openConnection() {
        ConnectionFactory factory = new ConnectionFactory();
        log.info("Try to connect to rabbitMQ {}:{} with user {} ", host, port, username);
        factory.setHost(host);
        factory.setPort(port);
        factory.setUsername(username);
        factory.setPassword(password);

        boolean created = false;
        int retry = 1;
        while (!created) {
            try {
                Connection connection = factory.newConnection();
                channelPool = new GenericObjectPool<>(new ChannelFactory(connection));

                channelForListening = connection.createChannel();
                channelForListening.addShutdownListener(cause -> log.error("Shutdown rabbitMQ channel " + cause));
                created = true;
            } catch (Exception exc) {
                log.error("Impossible to connect to rabbitMQ", exc);
                if (retry == retries) {
                    log.error("Too much retries , connection to rabbitMQ not available");
                }
                try {
                    Thread.sleep(retryInterval);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                retry++;
            }
        }
    }

    @Override
    public void sendEvent(String eventKey, String eventMessage) {
        log.debug("Try to send message {} with key {} ", eventMessage, eventKey);
        Channel channelFromPool = null;
        try {
            createExchange(eventKey);
            channelFromPool = channelPool.borrowObject();
            channelFromPool.basicPublish(eventKey, "", null, eventMessage.getBytes(StandardCharsets.UTF_8));
        } catch (Exception exc) {
            log.error("Impossible to send message to  rabbitMQ", exc);
        }

        if (channelFromPool != null)
            try {
                channelPool.returnObject(channelFromPool);
            } catch (Exception exc) {
                log.error("Impossible to return channel to channel pool",exc);
            }

    }

    private void createExchange(String eventKey) {

        // event if rabbit does not create exchange if it already exists
        // avoid asking it to avoid unnecessary processing
        if (createdExchange.contains(eventKey))
            return;

        boolean created = false;
        int retry = 1;
        while (!created) {
            try {
                // Synchronization is recommended when accessing channel (ie RabbitMQ
                // documentation)
                synchronized (channelForListening) {
                    // the exchange is created as durable (third param set true)
                    // to persist after rabbit restart
                    channelForListening.exchangeDeclare(eventKey, BuiltinExchangeType.FANOUT, true, false, null);
                }
                created = true;
                log.info("Rabbit exchange created for " + eventKey);
                createdExchange.add(eventKey);
            } catch (Exception exc) {
                log.error("Impossible to create rabbitMQ exchange " + eventKey, exc);
                if (retry == retries) {
                    log.error("Too much retries , stop trying to create  exchange " + eventKey);
                }
                try {
                    Thread.sleep(retryInterval);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                retry++;
            }
        }
    }

    @Override
    public void addListener(String eventKey, EventListener eventListener) {
        RabbitListener rabbitListener = rabbitListeners.get(eventKey);
        if (rabbitListener != null)
            rabbitListener.addEventListener(eventListener);
        else {
            // Queue name must be unique that's why we use the appName
            // this will not work if we have more the one instance of a service running
            // it is not the case but we may find another way of naming queue if we need it
            // in the future
            // the queue is not named by Rabbit as we need to persist the queue
            String queueName = appName + "." + eventKey;
            try {
                RabbitListener newRabbitListener = new RabbitListener(eventKey);
                createExchange(eventKey);
                createQueue(queueName, eventKey);
                DeliverCallback deliverCallback = (consumerTag, delivery) -> {
                    String message = new String(delivery.getBody(), StandardCharsets.UTF_8);
                    newRabbitListener.onEvent(message);
                };
                newRabbitListener.addEventListener(eventListener);
                channelForListening.basicConsume(queueName, true, deliverCallback, consumerTag -> {
                });
                rabbitListeners.put(eventKey, newRabbitListener);
                log.info("Rabbit listener create for " + eventKey);
            } catch (IOException exc) {
                log.error("Impossible to add rabbit listener for event  " + eventKey, exc);
            }
        }
    }

    private void createQueue(String queueName, String exchangeName) {

        boolean created = false;
        int retry = 1;
        while (!created) {
            try {

                synchronized (channelForListening) {
                    // IMPORTANT : second param is true for the queue to be durable (i.e persistent)
                    channelForListening.queueDeclare(queueName, true, false, false, null);
                    channelForListening.queueBind(queueName, exchangeName, exchangeName);
                }
                created = true;
                log.info("Queue created for " + queueName);
            } catch (Exception exc) {
                log.error("Impossible to create rabbitMQ queue " + queueName, exc);
                if (retry == retries) {
                    log.error("Too much retries , stop trying to create  queue " + queueName);
                }
                try {
                    Thread.sleep(retryInterval);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                retry++;
            }
        }

    }

    // This class groups together eventListener with the same eventKey
    // as we cannot have two thread consuming (basicConsume method) the same queue
    // otherwise each thread will receive alternately the message
    class RabbitListener {

        private String eventKey;
        private ArrayList<EventListener> eventListeners = new ArrayList<>();

        RabbitListener(String eventKey) {
            this.eventKey = eventKey;
        }

        public void addEventListener(EventListener eventListener) {
            eventListeners.add(eventListener);
        }

        public void onEvent(String message) {
            eventListeners.forEach(eventListener -> eventListener.onEvent(eventKey, message));

        }

    }

}
