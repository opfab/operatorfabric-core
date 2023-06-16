
/* Copyright (c) 2023, RTE (http://www.rte-france.com)
* See AUTHORS.txt
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
* SPDX-License-Identifier: MPL-2.0
* This file is part of the OperatorFabric project.
*/

package org.opfab.cards.publication.repositories;

import org.opfab.cards.publication.model.ArchivedCardPublicationData;
import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.users.model.User;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface CardRepository {

    public Optional<CardPublicationData> findByUid(String uid);

    public Optional<ArchivedCardPublicationData> findArchivedCardByUid(String uid);

    public void saveCard(CardPublicationData card);

    public void saveCardToArchive(ArchivedCardPublicationData card);

    public void deleteCard(CardPublicationData cardToDelete);

    public void updateArchivedCard(ArchivedCardPublicationData card);

    public CardPublicationData findCardById(String id);

    public Optional<List<CardPublicationData>> findChildCard(CardPublicationData card);

    public UserBasedOperationResult addUserAck(User user, String cardUid, List<String> entitiesAcks);

    public UserBasedOperationResult addUserRead(String name, String cardUid);

    public UserBasedOperationResult deleteUserAck(String userName, String cardUid);

    public UserBasedOperationResult deleteUserRead(String userName, String cardUid);

    public List<CardPublicationData>  deleteCardsByEndDateBefore(Instant endDateBefore);

    public List<CardPublicationData> findCardsByExpirationDate(Instant expirationDate);

    public UserBasedOperationResult deleteAcksAndReads(String cardUid);

}
