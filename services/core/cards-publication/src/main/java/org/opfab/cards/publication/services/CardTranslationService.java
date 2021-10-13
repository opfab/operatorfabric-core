/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.publication.services;

import java.io.IOException;

import javax.annotation.PreDestroy;

import com.fasterxml.jackson.databind.JsonNode;

import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.springtools.configuration.oauth.I18nProcessesCache;
import org.opfab.utilities.AmqpUtils;
import org.opfab.utilities.I18nTranslation;
import org.springframework.amqp.core.AcknowledgeMode;
import org.springframework.amqp.core.AmqpAdmin;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.listener.MessageListenerContainer;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import feign.FeignException;
import lombok.extern.slf4j.Slf4j;


@Service
@Slf4j
public class CardTranslationService {

    @Autowired
    private I18nProcessesCache i18nProcessesCache;
    private ConnectionFactory connectionFactory;
    private AmqpAdmin amqpAdmin;
    private Queue processQueue;
    private MessageListenerContainer processListener;

    private static final String PROCESS_QUEUE_NAME = "processQueue";

    @Autowired
    public CardTranslationService(FanoutExchange processExchange, ConnectionFactory connectionFactory, AmqpAdmin amqpAdmin,
    @Value("${operatorfabric.amqp.connectionRetryInterval:5000}") long retryInterval,
    @Value("${operatorfabric.amqp.connectionRetries:10}") int retries) {
        this.connectionFactory = connectionFactory;
        this.amqpAdmin = amqpAdmin;
        processQueue = AmqpUtils.createQueue(amqpAdmin, PROCESS_QUEUE_NAME, processExchange, retries, retryInterval);
        this.processListener = createMessageListenerContainer(PROCESS_QUEUE_NAME);
        registerProcessListener(processListener);
        processListener.start();
    }
    
    public void translate(CardPublicationData card) {

        try {
            JsonNode i18n = i18nProcessesCache.fetchProcessI18nFromCacheOrProxy(card.getProcess(), card.getProcessVersion());            
            I18nTranslation translation = new I18nTranslation(i18n);
            card.setTitleTranslated(translation.translate(card.getTitle().getKey(), card.getTitle().getParameters()));
            card.setSummaryTranslated(translation.translate(card.getSummary().getKey(), card.getSummary().getParameters()));
        } catch(FeignException | IOException ex) {
            log.error("Error getting card translation", ex);
            card.setTitleTranslated(card.getTitle().getKey());
            card.setSummaryTranslated(card.getSummary().getKey());
        }
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

    private void registerProcessListener(MessageListenerContainer mlc) {
        mlc.setupMessageListener(message -> clearProcessCache());
    }

    private void clearProcessCache() {
        i18nProcessesCache.clearCache();
    }


    @PreDestroy
    public void destroy() {
        processListener.stop();
        if (processQueue != null)
            amqpAdmin.deleteQueue(PROCESS_QUEUE_NAME);
    }
    
}
