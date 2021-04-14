/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.consultation.services;

import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
import net.minidev.json.parser.ParseException;
import org.opfab.springtools.configuration.oauth.UserServiceCache;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.listener.MessageListenerContainer;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;

import java.time.Instant;
import java.util.*;

/**
 * <p>This object manages subscription to AMQP exchange</p>
 *
 * <p>Two exchanges are used, {@link #cardExchange} and {@link #userExchange}.
 * See amqp.xml resource file ([project]/services/core/cards-publication/src/main/resources/amqp.xml)
 * for their exact configuration</p>
 *
 *
 */
@Slf4j
@EqualsAndHashCode
public class CardSubscription {
    public static final String GROUPS_SUFFIX = "Groups";
    public static final String DELETE_OPERATION = "DELETE";
    public static final String ERROR_MESSAGE_PARSING = "ERROR during received message parsing";
    private String queueName;
    private long current = 0;
    @Getter
    private CurrentUserWithPerimeters currentUserWithPerimeters;
    @Getter
    private String id;
    @Getter
    private Flux<String> publisher;
    private Flux<String> amqpPublisher;
    private FluxSink<String> messageSink;
    private AmqpAdmin amqpAdmin;
    private FanoutExchange cardExchange;
    private ConnectionFactory connectionFactory;
    private MessageListenerContainer cardListener;
    @Getter
    private Instant startingPublishDate;
    @Getter
    private boolean cleared = false;
    private final String clientId;
    private String userLogin;
    private boolean fluxHasBeenFirstInit = false;

    protected UserServiceCache userServiceCache;



    /**
     * Constructs a card subscription and init access to AMQP exchanges
     */
    @Builder
    public CardSubscription(CurrentUserWithPerimeters currentUserWithPerimeters,
                            String clientId,
                            Runnable doOnCancel,
                            AmqpAdmin amqpAdmin,
                            FanoutExchange cardExchange,
                            ConnectionFactory connectionFactory) {
        userLogin = currentUserWithPerimeters.getUserData().getLogin();
        this.id = computeSubscriptionId(userLogin, clientId);
        this.currentUserWithPerimeters = currentUserWithPerimeters;
        this.amqpAdmin = amqpAdmin;
        this.cardExchange = cardExchange;
        this.connectionFactory = connectionFactory;
        this.clientId = clientId;
        this.queueName = computeSubscriptionId(userLogin + GROUPS_SUFFIX, this.clientId);
    }

    public void updateCurrentUserWithPerimeters() {
        if (userServiceCache != null)
            try {
                currentUserWithPerimeters = userServiceCache.fetchCurrentUserWithPerimetersFromCacheOrProxy(userLogin);

            } catch (Exception exc) {
                // This situation arise when the usercache has been cleared and the token is expired
                // in this case the service cannot retrieve the user information 
                // it arise only in implicit mode as the user is not deconnected 
                // if token expired due to silent refresh mechanism
                //
                // When the user will make another request (for example : click on a card feed) 
                // the new token will be set and it will then retrieve user information on next call 
                // 
                log.info("Cannot get new perimeter for user {} , use old one ", userLogin);
            }
    }

    public static String computeSubscriptionId(String prefix, String clientId) {
        return prefix + "#" + clientId;
    }


    public void initSubscription(Runnable doOnCancel) {
        createQueue();
        this.cardListener = createMessageListenerContainer(queueName);
        this.publisher  = Flux.create(emitter -> {
            log.debug("Create message flux for user {}",userLogin);
            this.messageSink = emitter;
            registerListener(cardListener);
            emitter.onRequest(v -> log.debug("STARTING subscription for user {}",userLogin));
            emitter.onDispose(()->{
                log.debug("DISPOSING subscription for user {}",userLogin);
                doOnCancel.run();
            });

            if (!this.fluxHasBeenFirstInit) {
                emitter.next("INIT");
                this.fluxHasBeenFirstInit = true;
            }
            else emitter.next("RESTORE");
            cardListener.start();


        });

    }

    private void registerListener(MessageListenerContainer mlc) {
        mlc.setupMessageListener(message -> {
            JSONObject card;
            try
            {
               card = (JSONObject) (new JSONParser(JSONParser.MODE_PERMISSIVE)).parse(message.getBody());
            }
            catch(ParseException e){ log.error(ERROR_MESSAGE_PARSING, e); return;}

            if (checkIfUserMustReceiveTheCard(card)){
                publishDataIntoSubscription(new String(message.getBody()));
            }
            // In case of ADD or UPDATE, we send a delete card operation (to delete the card from the feed, more information in OC-297)
            else {
                String deleteMessage = createDeleteCardMessageForUserNotRecipient(card);
                if (! deleteMessage.isEmpty()) publishDataIntoSubscription(deleteMessage);
            }
        });
    }

    /**
     * <p>Constructs a non durable queue to cardExchange using queue name
     * [user login]Groups#[client id].</p>
     * @return
     */
    private Queue createQueue() {
        log.debug("CREATE queue for user {}",userLogin);
        Queue queue = QueueBuilder.nonDurable(queueName).build();
        amqpAdmin.declareQueue(queue);

        Binding binding = BindingBuilder.bind(queue).to(cardExchange);
        amqpAdmin.declareBinding(binding);

        return queue;
    }

    /**
     * Stops associated {@link MessageListenerContainer} and delete queues
     */
    public void clearSubscription() {
        log.debug("Clear subscription for user {}",userLogin);
        cardListener.stop();
        amqpAdmin.deleteQueue(queueName);
        cleared = true;
    }

    /**
     *
     * @return true if associated AMQP listeners are still running
     */
    public boolean checkActive(){
        return cardListener == null || cardListener.isRunning();
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

    public void updateRange() {
        startingPublishDate = Instant.now();
    }


    public void publishDataIntoSubscription(String message)
    {
        this.messageSink.next(message);
    }


    public void publishDataFluxIntoSubscription(Flux<String> messageFlux) {

        messageFlux.subscribe(next->this.messageSink.next(next));
    }

    public String createDeleteCardMessageForUserNotRecipient(JSONObject cardOperation) {

        String typeOperation = (cardOperation.get("type") != null) ? (String) cardOperation.get("type") : "";

        if (typeOperation.equals("ADD") || typeOperation.equals("UPDATE")) {
            JSONObject cardObj = (JSONObject) cardOperation.get("card");

            String idCard = (cardObj != null) ? (String) cardObj.get("id") : "";

            log.debug("Send delete card with id {} for user {}", idCard, userLogin);
            cardOperation.replace("type", DELETE_OPERATION);
            cardOperation.put("cardId", idCard);

            return cardOperation.toJSONString();
        }

        return "";
    }

    public boolean checkIfUserMustReceiveTheCard(JSONObject cardOperation) {
        updateCurrentUserWithPerimeters();
        return checkIfUserMustReceiveTheCard(cardOperation, currentUserWithPerimeters);
    }

    public boolean checkIfUserMustBeNotifiedForThisProcessState(String process, String state, CurrentUserWithPerimeters currentUserWithPerimeters) {
        Map<String, List<String>> processesStatesNotNotified = currentUserWithPerimeters.getProcessesStatesNotNotified();
        return ! ((processesStatesNotNotified != null) && (processesStatesNotNotified.get(process) != null) &&
                  (((List)processesStatesNotNotified.get(process)).contains(state)));
    }

    /**
     * @param messageBody message body received from rabbitMQ
     * @return true if the message received must be seen by the connected user.
     *         Rules for receiving cards :
     *         1) If the card is sent to the user directly then the user receive it
     *         2) If the card is sent to entity A and group B, then to receive it,
     *            the user must be part of A AND (be part of B OR have the right for the process/state of the card)
     *         3) If  the card is sent to entity A only, then to receive it,
     *            the user must be part of A and have the right for the process/state of the card
     *         4) If the card is sent to group B only, then to receive it, the user must be part of B
     */
    public boolean checkIfUserMustReceiveTheCard(JSONObject cardOperation, CurrentUserWithPerimeters currentUserWithPerimeters) {

        List<String> processStateList = new ArrayList<>();
        if (currentUserWithPerimeters.getComputedPerimeters() != null)
            currentUserWithPerimeters.getComputedPerimeters()
                    .forEach(perimeter -> processStateList.add(perimeter.getProcess() + "." + perimeter.getState()));

        JSONArray groupRecipientsIdsArray = (JSONArray) cardOperation.get("groupRecipientsIds");
        JSONArray entityRecipientsIdsArray = (JSONArray) cardOperation.get("entityRecipientsIds");
        JSONArray userRecipientsIdsArray = (JSONArray) cardOperation.get("userRecipientsIds");
        JSONObject cardObj = (JSONObject) cardOperation.get("card");
        String typeOperation = (cardOperation.get("type") != null) ? (String) cardOperation.get("type") : "";

        String idCard = null;
        String process = "";
        String state = "";
        if (cardObj != null) {
            idCard = (cardObj.get("id") != null) ? (String) cardObj.get("id") : "";

            process = (String) cardObj.get("process");
            state = (String) cardObj.get("state");
        }

        if (! checkIfUserMustBeNotifiedForThisProcessState(process, state, currentUserWithPerimeters))
            return false;

        String processStateKey = process + "." + state;
        List<String> userGroups = currentUserWithPerimeters.getUserData().getGroups();
        List<String> userEntities = currentUserWithPerimeters.getUserData().getEntities();

        log.debug("Check if user {} shall receive card {} for processStateKey {}", userLogin, idCard, processStateKey);

        // user only
        if (checkInCaseOfCardSentToUserDirectly(userRecipientsIdsArray)) {
            log.debug("User {} is in user recipients and shall receive card {}", userLogin, idCard);
            return true;
        }

        if (entityRecipientsIdsArray == null || entityRecipientsIdsArray.isEmpty()) { // card sent to group only

            boolean hasToReceive = checkInCaseOfCardSentToGroupOnly(userGroups, groupRecipientsIdsArray);
            if (hasToReceive)
                log.debug("No entity recipient, user {} is member of a group that shall receive card {} ", userLogin,
                        idCard);
            else
                log.debug("No entity recipient, user {} is not member of a group that shall receive card {} ",
                        userLogin, idCard);
            return hasToReceive;
        }

        if (groupRecipientsIdsArray == null || groupRecipientsIdsArray.isEmpty()) { // card sent to entity only
            boolean hasToReceive = checkInCaseOfCardSentToEntityOnly(userEntities, entityRecipientsIdsArray,
                    typeOperation, processStateKey, processStateList);
            if (hasToReceive)
                log.debug("No group recipient,  user {} has the good perimeter to receive card {} ", userLogin, idCard);
            else
                log.debug("No group recipient, user {} has not the good perimeter to receive card {} ", userLogin,
                        idCard);
            return hasToReceive;

        }

        // card sent to entity and group
        boolean hasToReceive = checkInCaseOfCardSentToEntityAndGroup(userEntities, userGroups, entityRecipientsIdsArray,
                groupRecipientsIdsArray, typeOperation, processStateKey, processStateList);

        if (hasToReceive)
            log.debug("Entity and group recipients, user {} has the good perimeter to receive card {} ", userLogin,
                    idCard);
        else
            log.debug("Entity and group recipients, user {} has not the good perimeter to receive card {} ", userLogin,
                    idCard);
        return hasToReceive;
    }


    boolean checkInCaseOfCardSentToUserDirectly(JSONArray userRecipientsIdsArray)
    {
        return  (userRecipientsIdsArray != null && !Collections.disjoint(Arrays.asList(userLogin), userRecipientsIdsArray));
    }

    boolean checkInCaseOfCardSentToGroupOnly(List<String> userGroups, JSONArray groupRecipientsIdsArray) {
        return (userGroups != null) && (groupRecipientsIdsArray != null)
                && !Collections.disjoint(userGroups, groupRecipientsIdsArray);
    }

    boolean checkInCaseOfCardSentToEntityOnly(List<String> userEntities, JSONArray entityRecipientsIdsArray,
                                             String typeOperation, String processStateKey,
                                             List<String> processStateList) {
        if (typeOperation.equals(DELETE_OPERATION))
            return (userEntities != null) && (!Collections.disjoint(userEntities, entityRecipientsIdsArray));

        return (userEntities != null) && (!Collections.disjoint(userEntities, entityRecipientsIdsArray))
                && (!Collections.disjoint(Arrays.asList(processStateKey), processStateList));
    }

    boolean checkInCaseOfCardSentToEntityAndGroup(List<String> userEntities, List<String> userGroups,
                                                  JSONArray entityRecipientsIdsArray, JSONArray groupRecipientsIdsArray,
                                                  String typeOperation, String processStateKey, List<String> processStateList) {
        if (typeOperation.equals(DELETE_OPERATION))
            return ((userEntities != null) && (userGroups != null)
                    && !Collections.disjoint(userEntities, entityRecipientsIdsArray)
                    && !Collections.disjoint(userGroups, groupRecipientsIdsArray))
                    ||
                    ((userEntities != null) && !Collections.disjoint(userEntities, entityRecipientsIdsArray));

        return ((userEntities != null) && (userGroups != null)
                && !Collections.disjoint(userEntities, entityRecipientsIdsArray)
                && !Collections.disjoint(userGroups, groupRecipientsIdsArray))
                ||
                ((userEntities != null)
                        && !Collections.disjoint(userEntities, entityRecipientsIdsArray)
                        && !Collections.disjoint(Arrays.asList(processStateKey), processStateList));
    }
}
