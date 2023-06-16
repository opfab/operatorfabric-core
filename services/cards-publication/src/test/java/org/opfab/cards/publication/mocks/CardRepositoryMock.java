/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.mocks;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.opfab.cards.publication.model.ArchivedCardPublicationData;
import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.cards.publication.repositories.CardRepository;
import org.opfab.cards.publication.repositories.UserBasedOperationResult;
import org.opfab.users.model.User;
import org.springframework.stereotype.Service;

@Service
public class CardRepositoryMock implements CardRepository {

    Map<String, CardPublicationData> cardsById = new HashMap<>();
    Map<String, CardPublicationData> cardsByUid = new HashMap<>();
    Map<String, ArchivedCardPublicationData> archiveCardsByUid = new HashMap<>();

    public CardRepositoryMock() {
    }

    public void clear() {
        cardsById.clear();
        cardsByUid.clear();
        archiveCardsByUid.clear();

    }

    @Override
    public Optional<CardPublicationData> findByUid(String uid) {
        CardPublicationData card = cardsByUid.get(uid);
        if (card == null)
            return Optional.empty();
        return Optional.of(card);

    }

    @Override
    public Optional<ArchivedCardPublicationData> findArchivedCardByUid(String uid) {
        ArchivedCardPublicationData card = archiveCardsByUid.get(uid);
        if (card == null)
            return Optional.empty();
        return Optional.of(card);
    }

    @Override
    public void saveCard(CardPublicationData card) {
        cardsById.put(card.getId(), card);
        cardsByUid.put(card.getUid(), card);
        return;
    }

    @Override
    public void saveCardToArchive(ArchivedCardPublicationData card) {
        archiveCardsByUid.put(card.getId(), card);
    }

    @Override
    public void deleteCard(CardPublicationData cardToDelete) {
        cardsById.remove(cardToDelete.getId());
        cardsByUid.remove(cardToDelete.getUid());
    }

    @Override
    public void updateArchivedCard(ArchivedCardPublicationData card) {
        archiveCardsByUid.put(card.getUid(), card);
    }

    @Override
    public CardPublicationData findCardById(String id) {
        return cardsById.get(id);
    }

    @Override
    public Optional<List<CardPublicationData>> findChildCard(CardPublicationData card) {
        List<CardPublicationData> children = new ArrayList<CardPublicationData>();
        if (card != null)
            cardsById.values().stream().forEach(child -> {
                if ((child.getParentCardId() != null) && child.getParentCardId().equals(card.getId()))
                    children.add(child);
            });
        return Optional.of(children);
    }

    @Override
    public UserBasedOperationResult addUserAck(User user, String cardUid, List<String> entitiesAcks) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'addUserRead'");
    }

    @Override
    public UserBasedOperationResult addUserRead(String name, String cardUid) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'addUserRead'");
    }

    @Override
    public UserBasedOperationResult deleteUserAck(String userName, String cardUid) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'deleteUserAck'");
    }

    @Override
    public UserBasedOperationResult deleteUserRead(String userName, String cardUid) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'deleteUserRead'");
    }

    @Override
    public List<CardPublicationData> deleteCardsByEndDateBefore(Instant endDateBefore) {

        List<CardPublicationData> cards = new ArrayList<CardPublicationData>();
        cardsById.values().stream().forEach(card -> {

            if (((card.getEndDate() != null) && card.getEndDate().getNano() < endDateBefore.getNano())
                    || ((card.getEndDate() == null) && (card.getStartDate().getNano() < endDateBefore.getNano()))) {
                cards.add(card);
            }
        });
        cards.forEach(card -> {
            cardsById.remove(card.getId());
            cardsByUid.remove(card.getUid());
        });
        return cards;
    }

    @Override
    public List<CardPublicationData> findCardsByExpirationDate(Instant expirationDate) {
        List<CardPublicationData> cards = new ArrayList<CardPublicationData>();
        cardsById.values().stream().forEach(card -> {
            if (((card.getExpirationDate() != null)
                    && (card.getExpirationDate().toEpochMilli() < expirationDate.toEpochMilli()))) {
                cards.add(card);
            }
        });
        return cards;
    }

    public int count() {
        return cardsById.size();
    }

    public int countArchivedCard() {
        System.err.println("Count archives = " + archiveCardsByUid.size());
        return archiveCardsByUid.size();
    }

    public List<CardPublicationData> findAll() {
        return cardsById.values().stream().toList();
    }

    @Override
    public UserBasedOperationResult deleteAcksAndReads(String cardUid) {
        return UserBasedOperationResult.cardFound().operationDone(true);
    }
}
