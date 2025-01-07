/* Copyright (c) 2021-2025, RTE (http://www.rte-france.com)
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
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.RightEnum;
import org.opfab.cards.consultation.model.PublisherTypeEnum;

import java.util.*;

@Slf4j
public class CardRoutingUtilities {

    private CardRoutingUtilities() {
    }

    public static boolean checkIfUserNeedToReceiveADeleteCardOperation(JSONObject cardOperation,
            CurrentUserWithPerimeters currentUserWithPerimeters) {
        // In case of an UPDATE, we need to send a delete card operation to delete the
        // card from the feed in case user was recipient of the previous version
        String typeOperation = cardOperation.get("type").toString();
        if (typeOperation.equals("UPDATE")) {
            JSONObject card = (JSONObject) cardOperation.get("card");
            String process = (String) card.get("process");
            String state = (String) card.get("state");
            if (isReceiveRightsForProcessAndState(process, state,
                    loadUserRightsPerProcessAndState(currentUserWithPerimeters))
                    && checkIfUserMustBeNotifiedForThisProcessState(process, state, currentUserWithPerimeters))
                return true;
        }
        return false;
    }

    public static boolean checkIfUserMustBeNotifiedForThisProcessState(String process, String state,
            CurrentUserWithPerimeters currentUserWithPerimeters) {
        Map<String, List<String>> processesStatesNotNotified = currentUserWithPerimeters
                .getProcessesStatesNotNotified();
        return !((processesStatesNotNotified != null) && (processesStatesNotNotified.get(process) != null) &&
                (processesStatesNotNotified.get(process).contains(state)));
    }

    private static Map<String, RightEnum> loadUserRightsPerProcessAndState(
            CurrentUserWithPerimeters currentUserWithPerimeters) {
        Map<String, RightEnum> userRightsPerProcessAndState = new HashMap<>();
        if (currentUserWithPerimeters.getComputedPerimeters() != null)
            currentUserWithPerimeters.getComputedPerimeters()
                    .forEach(perimeter -> userRightsPerProcessAndState
                            .put(perimeter.getProcess() + "." + perimeter.getState(), perimeter.getRights()));
        return userRightsPerProcessAndState;
    }

    private static boolean isReceiveRightsForProcessAndState(String processId, String stateId,
            Map<String, RightEnum> userRightsPerProcessAndState) {
        final RightEnum rights = userRightsPerProcessAndState.get(processId + '.' + stateId);
        return rights == RightEnum.Receive || rights == RightEnum.ReceiveAndWrite;
    }

    /**
     * Rules for receiving cards :
     * 1) If the card is sent to user1, the card is received and visible for user1
     * if he has the receive right for the
     * corresponding process/state (Receive or ReceiveAndWrite)
     * 2) If the card is sent to GROUP1 (or ENTITY1), the card is received and
     * visible for user if all the following is true :
     * - he's a member of GROUP1 (or ENTITY1)
     * - he has the receive right for the corresponding process/state (Receive or
     * ReceiveAndWrite)
     * 3) If the card is sent to ENTITY1 and GROUP1, the card is received and
     * visible for user if all the following is true :
     * - he's a member of ENTITY1 (either directly or through one of its children
     * entities)
     * - he's a member of GROUP1
     * - he has the receive right for the corresponding process/state (Receive or
     * ReceiveAndWrite)
     **/
    public static boolean checkIfUserMustReceiveTheCard(JSONObject cardOperation,
            CurrentUserWithPerimeters currentUserWithPerimeters) {

        String idCard;
        String process;
        String state;
        String publisher;
        String publisherType;
        JSONArray groupRecipientsArray;
        JSONArray entityRecipientsArray;
        JSONArray userRecipientsArray;
        JSONObject cardObj = (JSONObject) cardOperation.get("card");

        if (cardObj != null) {
            idCard = (cardObj.get("id") != null) ? (String) cardObj.get("id") : "";
            process = (String) cardObj.get("process");
            state = (String) cardObj.get("state");
            publisher = (String) cardObj.get("publisher");
            publisherType = (String) cardObj.get("publisherType");

            groupRecipientsArray = (JSONArray) cardObj.get("groupRecipients");
            entityRecipientsArray = (JSONArray) cardObj.get("entityRecipients");
            userRecipientsArray = (JSONArray) cardObj.get("userRecipients");
        } else
            return false;

        return checkIfUserMustReceiveTheCard(currentUserWithPerimeters,
                idCard,
                process,
                state,
                publisher,
                publisherType,
                groupRecipientsArray,
                userRecipientsArray,
                entityRecipientsArray);
    }

    public static boolean checkIfUserMustReceiveTheCard(CurrentUserWithPerimeters currentUserWithPerimeters,
            String idCard,
            String process,
            String state,
            String publisher,
            String publisherType,
            Collection<?> groupRecipientsArray,
            Collection<?> userRecipientsArray,
            Collection<?> entityRecipientsArray) {

        String processStateKey = process + "." + state;
        List<String> userGroups = currentUserWithPerimeters.getUserData().getGroups();
        List<String> userEntities = currentUserWithPerimeters.getUserData().getEntities();

        if (!checkIfUserMustBeNotifiedForThisProcessState(process, state, currentUserWithPerimeters))
            return false;

        log.debug("Check if user {} shall receive card {} for processStateKey {}",
                currentUserWithPerimeters.getUserData().getLogin(), idCard, processStateKey);

        // First, we check if the user has the right for receiving this card (Receive or
        // ReceiveAndWrite)

        Map<String, RightEnum> userRightsPerProcessAndState = loadUserRightsPerProcessAndState(
                currentUserWithPerimeters);
        if (!isReceiveRightsForProcessAndState(process, state, userRightsPerProcessAndState))
            return false;

        // Now, we check if the user is member of the group and/or entity (or the
        // recipient himself)
        if (checkInCaseOfCardSentToUserDirectly(userRecipientsArray,
                currentUserWithPerimeters.getUserData().getLogin())) { // user only
            log.debug("User {} is in user recipients and shall receive card {}",
                    currentUserWithPerimeters.getUserData().getLogin(), idCard);
            return true;
        }

        if (checkInCaseOfCardSentToGroupOrEntityOrBoth(userGroups, groupRecipientsArray, userEntities,
                entityRecipientsArray)) {
            log.debug("User {} is member of a group or/and entity that shall receive card {}",
                    currentUserWithPerimeters.getUserData().getLogin(), idCard);
            return true;
        }

        // FE-4573 : from now, we want the user to receive all the cards sent by its entities
        if (checkInCaseOfCardSentByEntitiesOfTheUser(publisher, publisherType, userEntities)) {
            log.debug("User {} is member of the entity that published the card {} so he shall receive it",
                    currentUserWithPerimeters.getUserData().getLogin(), idCard);
            return true;
        }

        if (checkInCaseOfCardSentByTheUserHimself(publisher, publisherType,
                currentUserWithPerimeters.getUserData().getLogin())) {
            log.debug("User {} is the publisher of the card {} so he shall receive it",
                    currentUserWithPerimeters.getUserData().getLogin(), idCard);
            return true;
        }

        return false;
    }

    private static boolean checkInCaseOfCardSentToUserDirectly(Collection<?> userRecipientsArray, String userLogin) {
        return (userRecipientsArray != null
                && !Collections.disjoint(Arrays.asList(userLogin), userRecipientsArray));
    }

    private static boolean checkInCaseOfCardSentToGroupOrEntityOrBoth(Collection<?> userGroups,
            Collection<?> groupRecipientsArray,
            Collection<?> userEntities,
            Collection<?> entityRecipientsArray) {
        if ((groupRecipientsArray != null) && (!groupRecipientsArray.isEmpty())
                && (Collections.disjoint(userGroups, groupRecipientsArray)))
            return false;
        if ((entityRecipientsArray != null) && (!entityRecipientsArray.isEmpty())
                && (Collections.disjoint(userEntities, entityRecipientsArray)))
            return false;
        return !((groupRecipientsArray == null || groupRecipientsArray.isEmpty()) &&
                (entityRecipientsArray == null || entityRecipientsArray.isEmpty()));
    }

    private static boolean checkInCaseOfCardSentByEntitiesOfTheUser(String publisher,
            String publisherType,
            Collection<?> userEntities) {
        return (publisherType.equals(PublisherTypeEnum.ENTITY.toString()) &&
                userEntities.contains(publisher));
    }

    private static boolean checkInCaseOfCardSentByTheUserHimself(String publisher,
                                                                 String publisherType,
                                                                 String userLogin) {
        return (publisherType.equals(PublisherTypeEnum.USER.toString()) &&
                publisher.equals(userLogin));
    }
}
