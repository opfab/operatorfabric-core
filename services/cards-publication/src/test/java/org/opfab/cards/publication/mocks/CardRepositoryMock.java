/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
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

import org.opfab.cards.publication.model.ArchivedCard;
import org.opfab.cards.publication.model.Card;
import org.opfab.cards.publication.repositories.CardRepository;
import org.opfab.cards.publication.repositories.UserBasedOperationResult;
import org.opfab.users.model.User;
import org.springframework.stereotype.Service;

@Service
public class CardRepositoryMock implements CardRepository {

    Map<String, Card> cardsById = new HashMap<>();
    Map<String, Card> cardsByUid = new HashMap<>();
    Map<String, ArchivedCard> archiveCardsByUid = new HashMap<>();

    public CardRepositoryMock() {
    }

    public void clear() {
        cardsById.clear();
        cardsByUid.clear();
        archiveCardsByUid.clear();

    }

    @Override
    public Optional<Card> findByUid(String uid) {
        Card card = cardsByUid.get(uid);
        if (card == null)
            return Optional.empty();
        return Optional.of(card);

    }

    @Override
    public Optional<ArchivedCard> findArchivedCardByUid(String uid) {
        ArchivedCard card = archiveCardsByUid.get(uid);
        if (card == null)
            return Optional.empty();
        return Optional.of(card);
    }

    @Override
    public void saveCard(Card card) {
        cardsById.put(card.id, card);
        cardsByUid.put(card.uid, card);
        return;
    }

    @Override
    public void saveCardToArchive(ArchivedCard card) {
        archiveCardsByUid.put(card.id(), card);
    }

    @Override
    public void deleteCard(Card cardToDelete) {
        cardsById.remove(cardToDelete.id);
        cardsByUid.remove(cardToDelete.uid);
    }

    @Override
    public void setArchivedCardAsDeleted(String process, String processInstanceId, Instant deletionDate) {
        return;
    }

    @Override
    public Card findCardById(String id, boolean dataFieldIncluded) {
        return cardsById.get(id);
    }

    @Override
    public Optional<List<Card>> findChildCard(Card card) {
        List<Card> children = new ArrayList<Card>();
        if (card != null)
            cardsById.values().stream().forEach(child -> {
                if ((child.parentCardId != null) && child.parentCardId.equals(card.id))
                    children.add(child);
            });
        return Optional.of(children);
    }

    @Override
    public void setChildCardDates(String parentCardId, Instant startDate, Instant endDate) {
        cardsById.values().stream().forEach(child -> {
            if ((child.parentCardId != null) && child.parentCardId.equals(parentCardId)) {
                child.startDate = startDate;
                child.endDate = endDate;
            }
        });
    }

    @Override
    public UserBasedOperationResult addUserAck(User user, String cardUid, List<String> entitiesAcks) {
        Optional<Card> found = this.findByUid(cardUid);
        if (found.isPresent()) {
            Card card = found.get();

            List<String> userAcks = new ArrayList<String>();
            if (card.usersAcks != null)
                userAcks.addAll(card.usersAcks);

            userAcks.add(user.getLogin());
            card.usersAcks = userAcks;

            if (entitiesAcks != null) {
                List<String> acks = new ArrayList<String>();

                if (card.entitiesAcks != null)
                    acks.addAll(card.entitiesAcks);

                acks.addAll(entitiesAcks);

                card.entitiesAcks = acks;
            }
            return UserBasedOperationResult.cardFound().operationDone(true);
        }
        return UserBasedOperationResult.cardNotFound();
    }

    @Override
    public UserBasedOperationResult addUserRead(String name, String cardUid) {
        Optional<Card> found = this.findByUid(cardUid);
        if (found.isPresent()) {
            Card card = found.get();
            List<String> userReads = new ArrayList<String>();

            if (card.usersReads != null)
                userReads.addAll(card.usersReads);

            userReads.add(name);
            card.usersReads = userReads;
            return UserBasedOperationResult.cardFound().operationDone(true);
        }
        return UserBasedOperationResult.cardNotFound();

    }

    @Override
    public UserBasedOperationResult deleteUserAck(String userName, String cardUid, List<String> entitiesAcks) {
        throw new UnsupportedOperationException("Unimplemented method 'deleteUserAck'");
    }

    @Override
    public UserBasedOperationResult deleteUserRead(String userName, String cardUid) {
        throw new UnsupportedOperationException("Unimplemented method 'deleteUserRead'");
    }

    @Override
    public List<Card> deleteCardsByEndDateBefore(Instant endDateBefore) {

        List<Card> cards = new ArrayList<Card>();
        cardsById.values().stream().forEach(card -> {

            if (((card.endDate != null) && card.endDate.getNano() < endDateBefore.getNano())
                    || ((card.endDate == null) && (card.startDate.getNano() < endDateBefore.getNano()))) {
                cards.add(card);
            }
        });
        cards.forEach(card -> {
            cardsById.remove(card.id);
            cardsByUid.remove(card.uid);
        });
        return cards;
    }

    @Override
    public List<Card> findCardsByExpirationDate(Instant expirationDate) {
        List<Card> cards = new ArrayList<Card>();
        cardsById.values().stream().forEach(card -> {
            if (((card.expirationDate != null)
                    && (card.expirationDate.toEpochMilli() < expirationDate.toEpochMilli()))) {
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

    public List<Card> findAll() {
        return cardsById.values().stream().toList();
    }

    @Override
    public UserBasedOperationResult deleteAcksAndReads(String cardUid) {
        return UserBasedOperationResult.cardFound().operationDone(true);
    }
}
