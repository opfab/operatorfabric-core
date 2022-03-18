/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.services;

import lombok.extern.slf4j.Slf4j;
import net.minidev.json.parser.JSONParser;

import org.opfab.springtools.configuration.oauth.UserServiceCache;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import net.minidev.json.JSONObject;
import net.minidev.json.parser.ParseException;

@Service
@Slf4j
public class CardSubscriptionService {


    private static final String ERROR_MESSAGE_PARSING = "ERROR during received message parsing";
    private final long heartbeatDelay;
    private Map<String, CardSubscription> cache = new ConcurrentHashMap<>();

    @Autowired
    protected UserServiceCache userServiceCache;

    @Autowired
    public CardSubscriptionService(
                                   @Value("${operatorfabric.heartbeat.delay:10000}")
                                   long heartbeatDelay) {

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
                if (sub != null) // subscription can be null if it has been evicted during the process of going throw the keys
                {
                    log.debug("Send heartbeat to {}",key);
                    sub.publishDataIntoSubscription("HEARTBEAT");
                }
            });

        }
    }

 
    public CardSubscription subscribe(CurrentUserWithPerimeters currentUserWithPerimeters,String clientId) {

        String subId = CardSubscription.computeSubscriptionId(currentUserWithPerimeters.getUserData().getLogin(),clientId);
        CardSubscription.CardSubscriptionBuilder cardSubscriptionBuilder = CardSubscription.builder()
                .currentUserWithPerimeters(currentUserWithPerimeters)
                .clientId(clientId);
        CardSubscription cardSubscription;
        cardSubscription = cardSubscriptionBuilder.build();
        cardSubscription.initSubscription(() -> evictSubscription(subId));
        cache.put(subId, cardSubscription);
        log.info("Subscription created with id {} for user {} ", cardSubscription.getId(), cardSubscription.getUserLogin());
        cardSubscription.userServiceCache = this.userServiceCache;
        return cardSubscription;
    }

    public void evictSubscription(String subId) {
        
        CardSubscription sub = cache.get(subId);
        if (sub == null) {
            log.info("Subscription with id {} already evicted , as it is not existing anymore ", subId);
            return;
        }
        cache.remove(subId); 
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
        if (currentUserWithPerimeters == null)
            throw new IllegalArgumentException("user is a mandatory parameter of CardSubscriptionService#findSubscription");
        if (uiId == null)
            throw new IllegalArgumentException("uiId is a mandatory parameter of CardSubscriptionService#findSubscription");
        String subId = CardSubscription.computeSubscriptionId(currentUserWithPerimeters.getUserData().getLogin(), uiId);
        return cache.get(subId);
    }

    // only use for testing purpose
    public void clearSubscriptions() {
        this.cache.clear();
    }

    public Collection<CardSubscription> getSubscriptions() {
        return cache.values();
    }


    public void onMessage(String queueName, String message) {

        log.debug("receive from rabbit queue {} message {}", queueName, message);
        switch (queueName) {
            case "process":
            case "ack":
                cache.values().forEach(subscription -> subscription.publishDataIntoSubscription(message));
                break;
            case "user":
                cache.values().forEach(subscription -> {
                            if (message.equals(subscription.getUserLogin()))
                                subscription.publishDataIntoSubscription("USER_CONFIG_CHANGE");
                        });
                break;
            case "card":
                cache.values().forEach(subscription -> processNewCard(message, subscription));
                break;
            default:
                log.info("unrecognized queue {}" , queueName);
        }
    }

    private void processNewCard(String cardAsString, CardSubscription subscription) {
        JSONObject card;
        try {
            card = (JSONObject) (new JSONParser(JSONParser.MODE_PERMISSIVE)).parse(cardAsString);
        } catch (ParseException e) {
            log.error(ERROR_MESSAGE_PARSING, e);
            return;
        }

        if (CardRoutingUtilities.checkIfUserMustReceiveTheCard(card,
                subscription.getCurrentUserWithPerimeters())) {
            subscription.publishDataIntoSubscription(cardAsString);
        }
        // In case of ADD or UPDATE, we send a delete card operation (to delete the card
        // from the feed, more information in OC-297)
        else {
            String deleteMessage = CardRoutingUtilities.createDeleteCardMessageForUserNotRecipient(card,
                    subscription.getUserLogin());
            if (!deleteMessage.isEmpty())
                subscription.publishDataIntoSubscription(deleteMessage);
        }
    }

}
