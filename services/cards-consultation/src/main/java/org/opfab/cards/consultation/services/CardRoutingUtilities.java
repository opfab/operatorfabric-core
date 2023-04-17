/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
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
import org.opfab.users.model.RightsEnum;

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

    private static Map<String, RightsEnum> loadUserRightsPerProcessAndState(
            CurrentUserWithPerimeters currentUserWithPerimeters) {
        Map<String, RightsEnum> userRightsPerProcessAndState = new HashMap<>();
        if (currentUserWithPerimeters.getComputedPerimeters() != null)
            currentUserWithPerimeters.getComputedPerimeters()
                    .forEach(perimeter -> userRightsPerProcessAndState
                            .put(perimeter.getProcess() + "." + perimeter.getState(), perimeter.getRights()));
        return userRightsPerProcessAndState;
    }

    private static boolean isReceiveRightsForProcessAndState(String processId, String stateId,
            Map<String, RightsEnum> userRightsPerProcessAndState) {
        final RightsEnum rights = userRightsPerProcessAndState.get(processId + '.' + stateId);
        return rights == RightsEnum.RECEIVE || rights == RightsEnum.RECEIVEANDWRITE;
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
        Map<String, RightsEnum> userRightsPerProcessAndState = loadUserRightsPerProcessAndState(
                currentUserWithPerimeters);

        JSONArray groupRecipientsIdsArray = (JSONArray) cardOperation.get("groupRecipientsIds");
        JSONArray entityRecipientsIdsArray = (JSONArray) cardOperation.get("entityRecipientsIds");
        JSONArray userRecipientsIdsArray = (JSONArray) cardOperation.get("userRecipientsIds");
        JSONObject cardObj = (JSONObject) cardOperation.get("card");

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

        log.debug("Check if user {} shall receive card {} for processStateKey {}",
                currentUserWithPerimeters.getUserData().getLogin(), idCard, processStateKey);

        // First, we check if the user has the right for receiving this card (Receive or
        // ReceiveAndWrite)
        if (!isReceiveRightsForProcessAndState(process, state, userRightsPerProcessAndState))
            return false;

        // Now, we check if the user is member of the group and/or entity (or the
        // recipient himself)
        if (checkInCaseOfCardSentToUserDirectly(userRecipientsIdsArray,
                currentUserWithPerimeters.getUserData().getLogin())) { // user only
            log.debug("User {} is in user recipients and shall receive card {}",
                    currentUserWithPerimeters.getUserData().getLogin(), idCard);
            return true;
        }

        if (checkInCaseOfCardSentToGroupOrEntityOrBoth(userGroups, groupRecipientsIdsArray, userEntities,
                entityRecipientsIdsArray)) {
            log.debug("User {} is member of a group or/and entity that shall receive card {}",
                    currentUserWithPerimeters.getUserData().getLogin(), idCard);
            return true;
        }
        return false;
    }

    private static boolean checkInCaseOfCardSentToUserDirectly(JSONArray userRecipientsIdsArray, String userLogin) {
        return (userRecipientsIdsArray != null
                && !Collections.disjoint(Arrays.asList(userLogin), userRecipientsIdsArray));
    }

    private static boolean checkInCaseOfCardSentToGroupOrEntityOrBoth(List<String> userGroups,
            JSONArray groupRecipientsIdsArray,
            List<String> userEntities, JSONArray entityRecipientsIdsArray) {
        if ((groupRecipientsIdsArray != null) && (!groupRecipientsIdsArray.isEmpty())
                && (Collections.disjoint(userGroups, groupRecipientsIdsArray)))
            return false;
        if ((entityRecipientsIdsArray != null) && (!entityRecipientsIdsArray.isEmpty())
                && (Collections.disjoint(userEntities, entityRecipientsIdsArray)))
            return false;
        return !((groupRecipientsIdsArray == null || groupRecipientsIdsArray.isEmpty()) &&
                (entityRecipientsIdsArray == null || entityRecipientsIdsArray.isEmpty()));
    }
}
