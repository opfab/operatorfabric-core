/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.services;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.opfab.cards.consultation.model.Card;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.springframework.stereotype.Service;

@Service
public class ConnectedRecipientsPreviewService {

    private final CardSubscriptionService cardSubscriptionService;

    public ConnectedRecipientsPreviewService(CardSubscriptionService cardSubscriptionService) {
        this.cardSubscriptionService = cardSubscriptionService;
    }

    public List<String> getConnectedRecipients(Card lightcard) {
        List<String> connectedRecipients = new ArrayList<>();

        List<String> cardRecipients = lightcard.entityRecipients;
        List<String> cardRecipientsForInformation = lightcard.entityRecipientsForInformation;

        List<String> cardTotalRecipients = new ArrayList<>(cardRecipients);
        cardTotalRecipients.addAll(cardRecipientsForInformation);
        Collection<CardSubscription> connections = this.cardSubscriptionService.getSubscriptions();
        for (CardSubscription cardSubscription : connections) {
            CurrentUserWithPerimeters userWithPerimeters = cardSubscription.getCurrentUserWithPerimeters();
            if (CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                    userWithPerimeters,
                    lightcard.id,
                    lightcard.process,
                    lightcard.state,
                    lightcard.publisher,
                    lightcard.publisherType.toString(),
                    lightcard.groupRecipients,
                    lightcard.userRecipients,
                    cardTotalRecipients)) {
                for (String entity : userWithPerimeters.getUserData().getEntities()) {
                    if (cardTotalRecipients.contains(entity)) {
                        connectedRecipients.add(entity);
                    }
                }
            }
        }
        return connectedRecipients;
    }

}
