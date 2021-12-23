/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.services;

import lombok.extern.slf4j.Slf4j;
import org.opfab.springtools.configuration.oauth.UserServiceCache;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.springframework.amqp.core.AmqpAdmin;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;



@Service
@Slf4j
public class CardSubscriptionService {

 
    private final FanoutExchange cardExchange;
    private final FanoutExchange processExchange;
    private final FanoutExchange userExchange;
    private final AmqpAdmin amqpAdmin;
    private final long heartbeatDelay;
    private final ConnectionFactory connectionFactory;
    private Map<String, CardSubscription> cache = new ConcurrentHashMap<>();

    @Autowired
    protected UserServiceCache userServiceCache;

    @Value("${operatorfabric.amqp.connectionRetries:10}")
    private int retries;

    @Value("${operatorfabric.amqp.connectionRetryInterval:5000}")
    private long retryInterval;


    @Autowired
    public CardSubscriptionService(
                                   FanoutExchange cardExchange,
                                   FanoutExchange processExchange,
                                   FanoutExchange userExchange,
                                   ConnectionFactory connectionFactory,
                                   AmqpAdmin amqpAdmin,
                                   @Value("${operatorfabric.heartbeat.delay:10000}")
                                   long heartbeatDelay) {
        this.cardExchange = cardExchange;
        this.processExchange = processExchange;
        this.userExchange = userExchange;
        this.amqpAdmin = amqpAdmin;
        this.connectionFactory = connectionFactory;
        this.heartbeatDelay = heartbeatDelay;
        Thread heartbeat = new Thread(){
            @Override
            public void run(){
                sendHeartbeatMessageInAllSubscriptions();
            }
          };
        
        heartbeat.start();
    }


    private void sendHeartbeatMessageInAllSubscriptions()
    {
        for(;;)
        {
            try
                {
                Thread.sleep(heartbeatDelay);
                }
                catch (InterruptedException ex)
                {
                    log.error("Impossible to launch heartbeat ",ex);
                    Thread.currentThread().interrupt(); // Cf sonar java:S2142 "InterruptedException" should not be ignored
                    return; 
                }
            log.debug("Send heartbeat to all subscription");
            cache.keySet().forEach(key -> {
                CardSubscription sub = cache.get(key); 
                if (key!=null) // subscription can be null if it has been evict during the process of going throw the keys 
                {
                    if (!sub.isClosed()) {
                        log.debug("Send heartbeat to {}",key);
                        sendHeartbeat(sub);
                    }
                }
            });

        }
    }

    private void sendHeartbeat(CardSubscription subscription)
    {
        if (subscription!=null) subscription.publishDataIntoSubscription("HEARTBEAT");
    }

    /**
     * <p>Generates a {@link CardSubscription} or retrieve it from a local {@link CardSubscription} cache.</p>
     */
    public CardSubscription subscribe(
            CurrentUserWithPerimeters currentUserWithPerimeters,
            String clientId) {
        String subId = CardSubscription.computeSubscriptionId(currentUserWithPerimeters.getUserData().getLogin(), clientId);
        CardSubscription cardSubscription = cache.get(subId);
        
        if (cardSubscription == null) {
            CardSubscription.CardSubscriptionBuilder cardSubscriptionBuilder = CardSubscription.builder()
           .currentUserWithPerimeters(currentUserWithPerimeters)
           .clientId(clientId)
           .amqpAdmin(amqpAdmin)
           .cardExchange(this.cardExchange)
           .processExchange(this.processExchange)
           .userExchange(this.userExchange)
           .connectionFactory(this.connectionFactory);
            cardSubscription = buildSubscription(subId, cardSubscriptionBuilder);
        } 
        return cardSubscription;
    }

    private CardSubscription buildSubscription(String subId, CardSubscription.CardSubscriptionBuilder cardSubscriptionBuilder) {
        CardSubscription cardSubscription;
        cardSubscription = cardSubscriptionBuilder.build();
        cardSubscription.initSubscription(retries, retryInterval, () -> evictSubscription(subId));
        cache.put(subId, cardSubscription);
        log.info("Subscription created with id {} for user {} ", cardSubscription.getId(),cardSubscription.getUserLogin());
        cardSubscription.userServiceCache = this.userServiceCache;
        return cardSubscription;
    }



    public void evictSubscription(String subId) {
        log.info("Trying to evict subscription with id {}", subId);
        
        CardSubscription sub = cache.get(subId);
        if (sub==null) {
            log.info("Subscription {} is not existing anymore ", subId);
            return;
        }
        // remove first in cache to avoid the user getting a close subscription 
        // if it happens it is not really an issue as the ui will reopen it as it will see 
        // it is closed 
        cache.remove(subId); 
        sub.clearSubscription();
        log.info("Subscription with id {} evicted (user {})", subId , sub.getUserLogin());
    }

    /**
     * <p>Find existing subscription</p>
     * <p>NB: May throw {@link IllegalStateException} if any of the parameters is missing</p>
     * @param currentUserWithPerimeters Users whom subscription we search
     * @param uiId Unique client id whom subscription we search
     * @return
     */
    public CardSubscription findSubscription(CurrentUserWithPerimeters currentUserWithPerimeters, String uiId) {
        if(currentUserWithPerimeters == null)
            throw new IllegalArgumentException("user is a mandatory parameter of CardSubscriptionService#findSubscription");
        if(uiId == null)
            throw new IllegalArgumentException("uiId is a mandatory parameter of CardSubscriptionService#findSubscription");
        String subId = CardSubscription.computeSubscriptionId(currentUserWithPerimeters.getUserData().getLogin(), uiId);
        return cache.get(subId);
    }

    // only use for testing purpose
    public void clearSubscriptions() {
        this.cache.forEach((k,v)->v.clearSubscription());
        this.cache.clear();
    }

    public Collection<CardSubscription> getSubscriptions()
    {
        return cache.values();
    }
}
