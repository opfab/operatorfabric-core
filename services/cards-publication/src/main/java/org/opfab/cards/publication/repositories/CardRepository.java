
/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
* See AUTHORS.txt
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
* SPDX-License-Identifier: MPL-2.0
* This file is part of the OperatorFabric project.
*/

package org.opfab.cards.publication.repositories;

import org.opfab.cards.publication.model.ArchivedCard;
import org.opfab.cards.publication.model.Card;
import org.opfab.users.model.User;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface CardRepository {

    public Optional<Card> findByUid(String uid);

    public Optional<ArchivedCard> findArchivedCardByUid(String uid);

    public void saveCard(Card card);

    public void saveCardToArchive(ArchivedCard card);

    public void deleteCard(Card cardToDelete);

    public void setArchivedCardAsDeleted(String process, String processInstanceId,Instant deletionDate);

    public Card findCardById(String id);

    public Optional<List<Card>> findChildCard(Card card);

    public void setChildCardDates(String parentCardId, Instant startDate, Instant endDate);

    public UserBasedOperationResult addUserAck(User user, String cardUid, List<String> entitiesAcks);

    public UserBasedOperationResult addUserRead(String name, String cardUid);

    public UserBasedOperationResult deleteUserAck(String userName, String cardUid, List<String> entitiesAcks);

    public UserBasedOperationResult deleteUserRead(String userName, String cardUid);

    public List<Card>  deleteCardsByEndDateBefore(Instant endDateBefore);

    public List<Card> findCardsByExpirationDate(Instant expirationDate);

    public UserBasedOperationResult deleteAcksAndReads(String cardUid);

}
