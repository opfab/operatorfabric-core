/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.cards.publication.services;

import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.users.model.ComputedPerimeter;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.RightsEnum;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * <p>
 * Responsible of checking user rights to publish, edit or delete a card
 */
@Service
@Slf4j
public class CardPermissionControlService {

    boolean isCardPublisherAllowedForUser(CardPublicationData card, String login) {
        if (card.getRepresentative() != null) {
            if (card.getRepresentativeType().equals(org.opfab.cards.publication.model.PublisherTypeEnum.EXTERNAL))
                return card.getRepresentative().equals(login);
        } else if (card.getPublisherType().equals(org.opfab.cards.publication.model.PublisherTypeEnum.EXTERNAL)) {
            return card.getPublisher().equals(login);
        }
        return true;
    }

    boolean isUserAllowedToEditCard(CurrentUserWithPerimeters user, CardPublicationData card, CardPublicationData oldCard) {
        return oldCard.getPublisher().equals(card.getPublisher()) || isUserInEntityAllowedToEditCard(oldCard, user);
    }

    private boolean isUserInEntityAllowedToEditCard(CardPublicationData card, CurrentUserWithPerimeters user) {
        if (user.getUserData().getEntities().contains(card.getPublisher()))
            return true;
        List<String> entitiesAllowed = card.getEntitiesAllowedToEdit();
        if (entitiesAllowed != null) {
            List<String> userEntitiesAllowed = user.getUserData().getEntities().stream().filter(entitiesAllowed::contains).collect(Collectors.toList());
            return !userEntitiesAllowed.isEmpty();
        }
        return false;
    }

    boolean isCardPublisherInUserEntities(CardPublicationData card, CurrentUserWithPerimeters user) {


        Optional<List<String>> entitiesUser= Optional.ofNullable(user.getUserData().getEntities());
        //Check thah publisher is included in user entities
        return entitiesUser.isPresent() && !entitiesUser.get().isEmpty() && entitiesUser.get().contains(card.getPublisher());
    }

    /* 1st check : card.publisherType == ENTITY
   2nd check : the card has been sent by an entity of the user connected
   3rd check : the user has the Write access to the process/state of the card */
    boolean isUserAllowedToDeleteThisCard(CardPublicationData card, CurrentUserWithPerimeters user) {
        return card.getPublisherType() == org.opfab.cards.publication.model.PublisherTypeEnum.ENTITY
            && user.getUserData().getEntities().contains(card.getPublisher()) && checkUserPerimeterForCard(user.getComputedPerimeters(), card);
    }

    boolean isUserAuthorizedToSendCard(CardPublicationData card, CurrentUserWithPerimeters user){
        return checkUserPerimeterForCard(user.getComputedPerimeters(), card);
    }

    private boolean checkUserPerimeterForCard(List<ComputedPerimeter> perimeters, CardPublicationData card) {
        Optional<ComputedPerimeter> cardPerimeter = perimeters.stream().
                filter(x->x.getState().equalsIgnoreCase(card.getState()) && x.getProcess().equalsIgnoreCase(card.getProcess())).findFirst();
        return cardPerimeter.isPresent() && (RightsEnum.WRITE.equals(cardPerimeter.get().getRights())|| RightsEnum.RECEIVEANDWRITE.equals(cardPerimeter.get().getRights()));
    }
}
