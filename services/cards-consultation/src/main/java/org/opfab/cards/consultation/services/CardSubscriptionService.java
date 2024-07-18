/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.services;

import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
import net.minidev.json.parser.ParseException;
import org.opfab.useractiontracing.model.UserActionEnum;
import org.opfab.useractiontracing.services.UserActionLogService;
import org.opfab.springtools.configuration.oauth.UserServiceCache;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.utilities.eventbus.EventBus;
import org.opfab.utilities.eventbus.EventListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class CardSubscriptionService implements EventListener {

    @Value("${operatorfabric.checkIfUserIsAlreadyConnected:true}")
    private boolean checkIfUserIsAlreadyConnected;

    private static final String ERROR_MESSAGE_PARSING = "ERROR during received message parsing";
    private final long heartbeatDelay;
    private final long heartbeatDelayInSecondsToConsiderUserDisconnected;

    private final long heartbeatCheckIntervalInSeconds;
    private Map<String, CardSubscription> cache = new ConcurrentHashMap<>();


    protected UserServiceCache userServiceCache;
    protected UserActionLogService userActionLogService;

    private @Value("${operatorfabric.userActionLogActivated:true}") boolean userActionLogActivated;


    public CardSubscriptionService(
                                    UserServiceCache userServiceCache,
                                    UserActionLogService userActionLogService,
                                    EventBus eventBus,
                                    @Value("${operatorfabric.heartbeat.checkIntervalInSeconds:10}")
                                    long heartbeatCheckIntervalInSeconds,
                                    @Value("${operatorfabric.heartbeat.delayInSecondsToConsiderUserDisconnected:100}")
                                    long heartbeatDelayInSecondsToConsiderUserDisconnected,
                                    @Value("${operatorfabric.heartbeat.delay:10000}")
                                    long heartbeatDelay) {
        this.userServiceCache = userServiceCache;
        this.userActionLogService = userActionLogService;

        eventBus.addListener("card",this);
        eventBus.addListener("process",this);
        eventBus.addListener("user",this);
        eventBus.addListener("ack",this);
        
        this.heartbeatDelay = heartbeatDelay;
        this.heartbeatDelayInSecondsToConsiderUserDisconnected = heartbeatDelayInSecondsToConsiderUserDisconnected;
        this.heartbeatCheckIntervalInSeconds = heartbeatCheckIntervalInSeconds;
        Thread heartbeat = new Thread(){
            @Override
            public void run(){
                sendHeartbeatMessageInAllSubscriptions();
            }
          };
        Thread heartbeatFromFront = new Thread(){
        @Override
        public void run(){
            compareLastHeartbeatReceived();
        }
        };
        
        heartbeat.start();
        heartbeatFromFront.start();

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

    private void compareLastHeartbeatReceived()
    {
        for(;;)
        {
            try
                {
                Thread.sleep(heartbeatCheckIntervalInSeconds*1000);
                }
                catch (InterruptedException ex)
                {
                    log.error("Impossible to read receiving heartbeats",ex);
                    Thread.currentThread().interrupt(); // Cf sonar java:S2142 "InterruptedException" should not be ignored
                    return; 
                }
            log.debug("Comparing last heartbeat received");
            cache.keySet().forEach(key -> {
                CardSubscription sub = cache.get(key); 
                if (sub != null) // subscription can be null if it has been evicted during the process of going throw the keys
                {
                    log.debug("Time since last heart beat : {}", Instant.now().getEpochSecond() - sub.getHeartbeatReceptionDate().getEpochSecond());
                    if (Instant.now().getEpochSecond() - sub.getHeartbeatReceptionDate().getEpochSecond()  > heartbeatDelayInSecondsToConsiderUserDisconnected) {
                        log.info("User with subscription id  {}  has not sent heartbeat for more than {} seconds and got disconnected", sub.getId(), heartbeatDelayInSecondsToConsiderUserDisconnected) ; 
                        this.evictSubscription(sub.getId());                
                    }
                }
            });

        }
    }

    public boolean mustCheckIfUserIsAlreadyConnected() {
        return checkIfUserIsAlreadyConnected;
    }

    public boolean willDisconnectAnExistingSubscriptionWhenLoggingIn(String userLogin) {
        return mustCheckIfUserIsAlreadyConnected() && isUserAlreadyConnected(userLogin);
    }

    public void saveHeartbeat(CurrentUserWithPerimeters currentUserWithPerimeters, String clientId) {
        CardSubscription sub = this.findSubscription(currentUserWithPerimeters, clientId);
        if (sub != null) {
            sub.setHeartbeatReceptionDate(Instant.now());
        } else {
            log.info("This user {} has no card subscription", currentUserWithPerimeters.getUserData().getLogin());
        }
    }

    public CardSubscription subscribe(CurrentUserWithPerimeters currentUserWithPerimeters, String clientId) {
        return this.subscribe(currentUserWithPerimeters, clientId, null, false);
    }

    public CardSubscription subscribe(CurrentUserWithPerimeters currentUserWithPerimeters, String clientId, String uiVersion, boolean sendReload) {

        if (mustCheckIfUserIsAlreadyConnected()) {
            String userLogin = currentUserWithPerimeters.getUserData().getLogin();
            disconnectAllUsersWithSameLogin(userLogin);
        }

        String subId = CardSubscription.computeSubscriptionId(currentUserWithPerimeters.getUserData().getLogin(),clientId);
        CardSubscription.CardSubscriptionBuilder cardSubscriptionBuilder = CardSubscription.builder()
                .currentUserWithPerimeters(currentUserWithPerimeters)
                .userServiceCache(userServiceCache)
                .clientId(clientId);
        CardSubscription cardSubscription;
        cardSubscription = cardSubscriptionBuilder.build();

        cardSubscription.initSubscription(sendReload, () -> evictSubscription(subId));
        cache.put(subId, cardSubscription);
        log.info("Subscription created with id {} for user {} ", cardSubscription.getId(), cardSubscription.getUserLogin());

        String cardSubscriptionId = cardSubscription.getId().split("#")[1];
        logUserAction(currentUserWithPerimeters.getUserData().getLogin(), UserActionEnum.OPEN_SUBSCRIPTION, currentUserWithPerimeters.getUserData().getEntities(), null, "ClientId: " + cardSubscriptionId + " Ver: " + uiVersion);

        return cardSubscription;
    }



    private void disconnectAllUsersWithSameLogin(String userLogin) {
        cache.keySet().forEach(key -> {
            CardSubscription sub = cache.get(key);
            boolean isSameLogin = sub != null && userLogin.equals(sub.getUserLogin());

            if (isSameLogin)  {
                log.info("Send disconnection request message to {}",key);
                sub.publishDataIntoSubscription("DISCONNECT_USER_DUE_TO_NEW_CONNECTION");
            }
        });

    }

    private boolean isUserAlreadyConnected(String userLogin) {
        Optional<CardSubscription> userSubscription = cache.values().stream().filter(sub -> sub.getUserLogin().equals(userLogin)).findFirst();
        return userSubscription.isPresent();
    }

    public void deleteSubscription(String login, String clientId) {
        evictSubscription(CardSubscription.computeSubscriptionId(login, clientId));
    }

    public void evictSubscription(String subId) {
        
        CardSubscription sub = cache.get(subId);
        if (sub == null) {
            log.info("Subscription with id {} already evicted , as it is not existing anymore ", subId);
            return;
        }
        cache.remove(subId); 
        log.info("Subscription with id {} evicted (user {})", subId , sub.getUserLogin());

        String cardSubscriptionId = subId.split("#")[1];
        logUserAction(sub.getUserLogin(), UserActionEnum.CLOSE_SUBSCRIPTION, sub.getCurrentUserWithPerimeters().getUserData().getEntities(), null, "ClientId: " + cardSubscriptionId);
    }

    /**
     * <p>Find existing subscription</p>
     * <p>NB: May throw {@link IllegalStateException} if any of the parameters is missing</p>
     * @param currentUserWithPerimeters Users whom subscription we search
     * @param uiId Unique client id whom subscription we search
     * @return
     */
    public CardSubscription findSubscription(CurrentUserWithPerimeters currentUserWithPerimeters, String clientId) {
        if (currentUserWithPerimeters == null)
            throw new IllegalArgumentException("user is a mandatory parameter of CardSubscriptionService#findSubscription");
        if (clientId == null)
            throw new IllegalArgumentException("clientId is a mandatory parameter of CardSubscriptionService#findSubscription");
        String subId = CardSubscription.computeSubscriptionId(currentUserWithPerimeters.getUserData().getLogin(), clientId);
        return cache.get(subId);
    }

    // only use for testing purpose
    public void clearSubscriptions() {
        this.cache.clear();
    }

    public Collection<CardSubscription> getSubscriptions() {
        return cache.values();
    }

    private void processNewCard(String cardOperationAsString, CardSubscription subscription) {
        JSONObject cardOperation;
        try {
            cardOperation = (JSONObject) (new JSONParser(JSONParser.MODE_PERMISSIVE)).parse(cardOperationAsString);
        } catch (ParseException e) {
            log.error(ERROR_MESSAGE_PARSING, e);
            return;
        }

        if (CardRoutingUtilities.checkIfUserMustReceiveTheCard(cardOperation,
                subscription.getCurrentUserWithPerimeters())) {
            publishCard(cardOperation, subscription);
        }
        else {
            publishCardDelete(cardOperation, subscription);
        }
    }

    private void publishCard(JSONObject cardOperation, CardSubscription subscription) {
        if (cardOperation.get("type").equals("UPDATE")) { //for the front an update is considered as an ADD
            cardOperation.put("type", "ADD");

            JSONObject cardObj = (JSONObject) cardOperation.get("card");
            JSONArray usersAcks =(JSONArray) cardObj.get("usersAcks");
            JSONArray usersReads =(JSONArray) cardObj.get("usersReads");
            if (usersReads != null && usersReads.contains(subscription.getUserLogin()))
                cardObj.put("hasBeenRead", "true");
            if (usersAcks != null && usersAcks.contains(subscription.getUserLogin()))
                cardObj.put("hasBeenAcknowledged", "true");
        }
        subscription.publishDataIntoSubscription(cardOperation.toJSONString());
    }

    private void publishCardDelete(JSONObject cardOperation, CardSubscription subscription) {
        if (CardRoutingUtilities.checkIfUserNeedToReceiveADeleteCardOperation(cardOperation,subscription.getCurrentUserWithPerimeters())) { 
            cardOperation.replace("type", "DELETE");
            cardOperation.replace("card","");
            subscription.publishDataIntoSubscription(cardOperation.toJSONString());
        } 
    }

    public void postMessageToSubscriptions(String message) {
        getSubscriptions().forEach(subscription -> {
                log.info("message '{}' sent to subscription '{}'", message, subscription.getId());
                subscription.publishDataIntoSubscription(message);
        });
    }

    private void logUserAction(String login, UserActionEnum actionType, List<String> entities, String cardUid, String comment) {
        if (userActionLogActivated) userActionLogService.insertUserActionLog(login,  actionType, entities, cardUid, comment);
    }


    @Override
    public void onEvent(String eventKey, String message) {
        log.debug("receive event {} with message {}", eventKey, message);
        switch (eventKey) {
            case "process","ack":
                cache.values().forEach(subscription -> subscription.publishDataIntoSubscription(message));
                break;
            case "user":
                cache.values().forEach(subscription -> subscription.publishDataIntoSubscription("USER_CONFIG_CHANGE"));
                break;
            case "card":
                cache.values().forEach(subscription -> processNewCard(message, subscription));
                break;
            default:
                log.info("unrecognized event {}" , eventKey);
        }
    }

}
