/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
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
import org.opfab.users.model.RightsEnum;

import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;

import java.util.*;

/**
 * <p>This object manages subscription to AMQP exchange</p>
 *
 * <p>Two exchanges are used, {@link #cardExchange} and {@link #userExchange}.
 * See amqp.xml resource file ([project]/services/cards-publication/src/main/resources/amqp.xml)
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
    private long current = 0;
    @Getter
    private CurrentUserWithPerimeters currentUserWithPerimeters;
    @Getter
    private String id;
    @Getter
    private Flux<String> publisher;
    private Flux<String> amqpPublisher;
    private FluxSink<String> messageSink;

    private final String clientId;
    private String userLogin;

    protected UserServiceCache userServiceCache;

    /**
     * Constructs a card subscription and init access to AMQP exchanges
     */
    @Builder
    public CardSubscription(CurrentUserWithPerimeters currentUserWithPerimeters,
                            String clientId
                            ) {
        userLogin = currentUserWithPerimeters.getUserData().getLogin();
        this.id = computeSubscriptionId(userLogin, clientId);
        this.currentUserWithPerimeters = currentUserWithPerimeters;
        this.clientId = clientId;
    }

    public String getUserLogin()
    {
        return userLogin;
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
        this.publisher = Flux.create(emitter -> {
            log.info("Create subscription for user {}", userLogin);
            this.messageSink = emitter;
            emitter.onRequest(v -> log.debug("Starting subscription for user {}", userLogin));
            emitter.onDispose(() -> {
                log.info("Disposing subscription for user {}", userLogin);
                doOnCancel.run();
            });
            emitter.next("INIT");
        });

    }

    public void processNewCard(String message) {
            JSONObject card;
            try
            {
               card = (JSONObject) (new JSONParser(JSONParser.MODE_PERMISSIVE)).parse(message);
            }
            catch(ParseException e){ log.error(ERROR_MESSAGE_PARSING, e); return;}

            if (checkIfUserMustReceiveTheCard(card)){
                publishDataIntoSubscription(message);
            }
            // In case of ADD or UPDATE, we send a delete card operation (to delete the card from the feed, more information in OC-297)
            else {
                String deleteMessage = createDeleteCardMessageForUserNotRecipient(card);
                if (! deleteMessage.isEmpty()) publishDataIntoSubscription(deleteMessage);
            }
    }

    
    public void publishDataIntoSubscription(String message)
    {
        if (this.messageSink!=null) this.messageSink.next(message);
    }


    public void publishDataFluxIntoSubscription(Flux<String> messageFlux) {

        messageFlux.subscribe(next -> this.messageSink.next(next));
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

    private Map<String, RightsEnum> loadUserRightsPerProcessAndState() {
        Map<String, RightsEnum> userRightsPerProcessAndState = new HashMap<>();
        if (currentUserWithPerimeters.getComputedPerimeters() != null)
            currentUserWithPerimeters.getComputedPerimeters()
                    .forEach(perimeter -> userRightsPerProcessAndState.put(perimeter.getProcess() + "." + perimeter.getState(), perimeter.getRights()));
        return userRightsPerProcessAndState;
    }

    private boolean isReceiveRightsForProcessAndState(String processId, String stateId, Map<String, RightsEnum> userRightsPerProcessAndState) {
        final RightsEnum rights = userRightsPerProcessAndState.get(processId + '.' + stateId);
        return rights == RightsEnum.RECEIVE || rights == RightsEnum.RECEIVEANDWRITE;
    }

    /** Rules for receiving cards :
    1) If the card is sent to user1, the card is received and visible for user1 if he has the receive right for the
       corresponding process/state (Receive or ReceiveAndWrite)
    2) If the card is sent to GROUP1 (or ENTITY1), the card is received and visible for user if all of the following is true :
         - he's a member of GROUP1 (or ENTITY1)
         - he has the receive right for the corresponding process/state (Receive or ReceiveAndWrite)
    3) If the card is sent to ENTITY1 and GROUP1, the card is received and visible for user if all of the following is true :
         - he's a member of ENTITY1 (either directly or through one of its children entities)
         - he's a member of GROUP1
         - he has the receive right for the corresponding process/state (Receive or ReceiveAndWrite)
    **/
    public boolean checkIfUserMustReceiveTheCard(JSONObject cardOperation, CurrentUserWithPerimeters currentUserWithPerimeters) {
        Map<String, RightsEnum> userRightsPerProcessAndState = loadUserRightsPerProcessAndState();

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

        if (!checkIfUserMustBeNotifiedForThisProcessState(process, state, currentUserWithPerimeters))
            return false;

        String processStateKey = process + "." + state;
        List<String> userGroups = currentUserWithPerimeters.getUserData().getGroups();
        List<String> userEntities = currentUserWithPerimeters.getUserData().getEntities();

        log.debug("Check if user {} shall receive card {} for processStateKey {}", userLogin, idCard, processStateKey);

        // First, we check if the user has the right for receiving this card (Receive or ReceiveAndWrite)
        if ((!typeOperation.equals(DELETE_OPERATION)) && (!isReceiveRightsForProcessAndState(process, state, userRightsPerProcessAndState)))
            return false;

        // Now, we check if the user is member of the group and/or entity (or the recipient himself)
        if (checkInCaseOfCardSentToUserDirectly(userRecipientsIdsArray)) {  // user only
            log.debug("User {} is in user recipients and shall receive card {}", userLogin, idCard);
            return true;
        }

        if (checkInCaseOfCardSentToGroupOrEntityOrBoth(userGroups, groupRecipientsIdsArray, userEntities, entityRecipientsIdsArray)) {
            log.debug("User {} is member of a group or/and entity that shall receive card {}", userLogin, idCard);
            return true;
        }
        return false;
    }


    boolean checkInCaseOfCardSentToUserDirectly(JSONArray userRecipientsIdsArray) {
        return  (userRecipientsIdsArray != null && !Collections.disjoint(Arrays.asList(userLogin), userRecipientsIdsArray));
    }

    private boolean checkInCaseOfCardSentToGroupOrEntityOrBoth(List<String> userGroups, JSONArray groupRecipientsIdsArray,
                                                               List<String> userEntities, JSONArray entityRecipientsIdsArray) {
        if ((groupRecipientsIdsArray != null) && (!groupRecipientsIdsArray.isEmpty())
                && (Collections.disjoint(userGroups, groupRecipientsIdsArray)))
            return false;
        if ((entityRecipientsIdsArray != null) && (!entityRecipientsIdsArray.isEmpty())
                && (Collections.disjoint(userEntities, entityRecipientsIdsArray)))
            return false;
        return ! ((groupRecipientsIdsArray == null || groupRecipientsIdsArray.isEmpty()) &&
                  (entityRecipientsIdsArray == null || entityRecipientsIdsArray.isEmpty()));
    }
}
