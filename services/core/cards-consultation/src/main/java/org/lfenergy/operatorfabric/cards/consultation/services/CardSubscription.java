/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.consultation.services;

import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
import net.minidev.json.parser.ParseException;
import org.lfenergy.operatorfabric.users.model.CurrentUserWithPerimeters;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.listener.MessageListenerContainer;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import reactor.core.publisher.EmitterProcessor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

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
    private EmitterProcessor<String> externalPublisher;
    private Flux<String> externalFlux;
    private FluxSink<String> externalSink;
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

    public static String computeSubscriptionId(String prefix, String clientId) {
        return prefix + "#" + clientId;
    }

    /**
     * <ul>
     * <li>Create a user queue and a group topic queue</li>
     * <li>Associate queues to message {@link MessageListenerContainer}.</li>
     * <li>Creates a amqpPublisher {@link Flux} to publish AMQP messages to</li>
     * </ul>
     * <p>
     * Listeners starts on {@link Flux} subscription.
     * </p>
     * <p>On subscription cancellation triggers doOnCancel</p>
     * @param doOnCancel
     */
    public void initSubscription(Runnable doOnCancel) {
        createQueue();
        this.cardListener = createMessageListenerContainer(queueName);
        amqpPublisher = Flux.create(emitter -> {
            registerListener(cardListener, emitter,userLogin+ GROUPS_SUFFIX);
            emitter.onRequest(v -> {
                log.debug("STARTING subscription for user {}",userLogin);
                cardListener.start();
                startingPublishDate = Instant.now();
            });
            emitter.onDispose(()->{
                log.info("DISPOSING amqp publisher");
                doOnCancel.run();
            });
        });
        this.externalPublisher = EmitterProcessor.create();
        this.externalSink = this.externalPublisher.sink();
        this.amqpPublisher = amqpPublisher
                .doOnError(t->log.error("ERROR on amqp publisher",t))
                .doOnComplete(()->log.info("COMPLETE amqp Publisher"))
                .doOnCancel(()->log.info("CANCELED amqp publisher"));
        this.externalFlux = this.externalPublisher
                .doOnError(t->log.error("ERROR on external publisher",t))
                .doOnComplete(()->log.info("COMPLETE external Publisher"))
                .doOnCancel(()->log.info("CANCELED external publisher"));
        this.publisher = amqpPublisher.mergeWith(externalFlux)
                .doOnError(t->log.error("ERROR on merged publisher",t))
                .doOnComplete(()->log.info("COMPLETE merged publisher"))
                .doOnCancel(()->log.info("CANCELED merged publisher"));
    }

    private void registerListener(MessageListenerContainer groupMlc, FluxSink<String> emitter, String queueName) {
        groupMlc.setupMessageListener(message -> {
            JSONObject card;
            try
            {
               card = (JSONObject) (new JSONParser(JSONParser.MODE_PERMISSIVE)).parse(message.getBody());
            }
            catch(ParseException e){ log.error(ERROR_MESSAGE_PARSING, e); return;}

            if (checkIfUserMustReceiveTheCard(card)){
                emitter.next(new String(message.getBody()));
            }
            // In case of ADD or UPDATE, we send a delete card operation (to delete the card from the feed, more information in OC-297)
            else {
                String deleteMessage = createDeleteCardMessageForUserNotRecipient(card);
                if (! deleteMessage.isEmpty())
                    emitter.next(deleteMessage);
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

    public void publishInto(Flux<String> fetchOldCards) {
        fetchOldCards.subscribe(next->this.externalSink.next(next));
    }

    public String createDeleteCardMessageForUserNotRecipient(JSONObject cardOperation) {

        String typeOperation = (cardOperation.get("type") != null) ? (String) cardOperation.get("type") : "";

        if (typeOperation.equals("ADD") || typeOperation.equals("UPDATE")) {
            JSONArray cards = (JSONArray) cardOperation.get("cards");
            JSONObject cardsObj = (cards != null) ? (JSONObject) cards.get(0) : null; // there is always only one card
                                                                                      // in the array
            String idCard = (cardsObj != null) ? (String) cardsObj.get("id") : "";

            log.debug("Send delete card with id {} for user {}", idCard, userLogin);
            cardOperation.replace("type", DELETE_OPERATION);
            cardOperation.appendField("cardIds", Arrays.asList(idCard));

            return cardOperation.toJSONString();
        }

        return "";
    }

    /**
     * @param messageBody message body received from rabbitMQ
     * @return true if the message received must be seen by the connected user.
     *         Rules for receiving cards : 1) If the card is send to the user
     *         directly then the user receive it 2) If the card is sent to entity A
     *         and group B, then to receive it, the user must be part of A AND (be
     *         part of B OR have the right for the process/state of the card) 3) If
     *         the card is sent to entity A only, then to receive it, the user must
     *         be part of A and have the right for the process/state of the card 4)
     *         If the card is sent to group B only, then to receive it, the user
     *         must be part of B
     */
    public boolean checkIfUserMustReceiveTheCard(JSONObject cardOperation) {

        List<String> processStateList = new ArrayList<>();
        if (currentUserWithPerimeters.getComputedPerimeters() != null)
            currentUserWithPerimeters.getComputedPerimeters()
                    .forEach(perimeter -> processStateList.add(perimeter.getProcess() + "." + perimeter.getState()));

        JSONArray groupRecipientsIdsArray = (JSONArray) cardOperation.get("groupRecipientsIds");
        JSONArray entityRecipientsIdsArray = (JSONArray) cardOperation.get("entityRecipientsIds");
        JSONArray userRecipientsIdsArray = (JSONArray) cardOperation.get("userRecipientsIds");
        JSONArray cards = (JSONArray) cardOperation.get("cards");
        String typeOperation = (cardOperation.get("type") != null) ? (String) cardOperation.get("type") : "";
        JSONObject cardsObj = (cards != null) ? (JSONObject) cards.get(0) : null; // there is always only one card in
                                                                                  // the array
        String idCard = null;
        if (cardsObj!=null) idCard = (cardsObj.get("id") != null) ? (String) cardsObj.get("id") : "";

        String processStateKey = (cardsObj != null) ? cardsObj.get("process") + "." + cardsObj.get("state") : "";
        List<String> userGroups = currentUserWithPerimeters.getUserData().getGroups();
        List<String> userEntities = currentUserWithPerimeters.getUserData().getEntities();

        log.debug("Check if user {} shall receive card {} for processStateKey {}", userLogin, idCard,processStateKey);

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
