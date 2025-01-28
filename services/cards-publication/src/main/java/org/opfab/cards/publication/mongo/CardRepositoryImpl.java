/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.mongo;

import com.mongodb.BasicDBObjectBuilder;
import com.mongodb.client.result.UpdateResult;
import lombok.extern.slf4j.Slf4j;

import org.opfab.cards.publication.model.ArchivedCard;
import org.opfab.cards.publication.model.Card;
import org.opfab.cards.publication.repositories.CardRepository;
import org.opfab.cards.publication.repositories.UserBasedOperationResult;
import org.opfab.users.model.User;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;


import java.time.Instant;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import static org.springframework.data.mongodb.core.query.Criteria.where;

@Slf4j
public class CardRepositoryImpl implements CardRepository {

    private MongoTemplate template;

    static final String START_DATE = "startDate";
    static final String END_DATE = "endDate";
    static final String USERS_ACKS = "usersAcks";
    static final String ENTITIES_ACKS = "entitiesAcks";
    static final String USERS_READS = "usersReads";
    static final String LAST_UPDATE = "lastUpdate";

    public CardRepositoryImpl(MongoTemplate template) {
        this.template = template;
    }

    public Optional<Card> findByUid(String uid) {
        Query query = new Query();
        query.addCriteria(Criteria.where("uid").is(uid));
        return Optional.ofNullable(template.findOne(query, Card.class));
    }

    public Optional<ArchivedCard> findArchivedCardByUid(String uid) {
        Query query = new Query();
        query.addCriteria(Criteria.where("id").is(uid));
        return Optional.ofNullable(template.findOne(query, ArchivedCard.class));
    }

    public void saveCard(Card card) {
        log.debug("preparing to write {}", card.toString());
        card.setLastUpdate(Instant.now());
        template.save(card);
    }

    public void saveCardToArchive(ArchivedCard card) {
        this.template.insert(card);
    }

    public void deleteCard(Card cardToDelete) {
        this.template.remove(cardToDelete);
    }

    public void setArchivedCardAsDeleted(String process, String processInstanceId, Instant deletionDate) {
        Query query = new Query();
        query.addCriteria(new Criteria().andOperator(
                where("process").is(process),
                where("processInstanceId").is(processInstanceId),
                where("deletionDate").isNull()));
        template.updateFirst(query, Update.update("deletionDate", deletionDate),
                ArchivedCard.class);
    }


    public Card findCardById(String id, boolean dataFieldIncluded) {
        /**
         * Uses a projection instead the default 'findById' method. This projection
         * excludes data which can be unpredictably huge depending on publisher needs.
         */
        Query findCardByIdWithoutDataField = new Query();
        if (!dataFieldIncluded) {
            findCardByIdWithoutDataField.fields().exclude("data");
        }
        findCardByIdWithoutDataField.addCriteria(Criteria.where("Id").is(id));

        return this.template.findOne(findCardByIdWithoutDataField, Card.class);
    }

    public Optional<List<Card>> findChildCard(Card card) {
        if (Objects.isNull(card))
            return Optional.empty();

        Query findCardByParentCardIdWithoutDataField = new Query();
        findCardByParentCardIdWithoutDataField.fields().exclude("data");
        findCardByParentCardIdWithoutDataField.addCriteria(Criteria.where("parentCardId").is(card.getId()));
        return Optional.ofNullable(template.find(findCardByParentCardIdWithoutDataField, Card.class));
    }

    public void setChildCardDates(String parentCardId, Instant startDate, Instant endDate) {
        Update update = new Update().set(START_DATE, startDate).set(END_DATE, endDate);
        UpdateResult updateChilds = template.updateMulti(Query.query(Criteria.where("parentCardId").is(parentCardId)),
        update,
        Card.class);
        log.debug("updated startDate and EndDate of {} child cards of {} parent card", updateChilds.getModifiedCount(),
        parentCardId);
    }

    public UserBasedOperationResult addUserAck(User user, String cardUid, List<String> entitiesAcks) {
        Update update = new Update()
            .addToSet(USERS_ACKS, user.getLogin())
            .addToSet(ENTITIES_ACKS,BasicDBObjectBuilder.start("$each", entitiesAcks).get())
            .set(LAST_UPDATE, Instant.now());

        UpdateResult updateFirst = template.updateFirst(Query.query(Criteria.where("uid").is(cardUid)),
                update,
                Card.class);
        log.debug("added {} occurrence of {}'s userAcks in the card with uid: {}", updateFirst.getModifiedCount(),
                cardUid);
        return toUserBasedOperationResult(updateFirst);
    }

    public UserBasedOperationResult addUserRead(String name, String cardUid) {
        Update update = new Update()
            .addToSet(USERS_READS, name)
            .set(LAST_UPDATE, Instant.now());

        UpdateResult updateFirst = template.updateFirst(Query.query(Criteria.where("uid").is(cardUid)),
                update, 
                Card.class);
        log.debug("added {} occurrence of {}'s userReads in the card with uid: {}", updateFirst.getModifiedCount(),
                cardUid);
        return toUserBasedOperationResult(updateFirst);
    }

    public UserBasedOperationResult deleteUserAck(String userName, String cardUid, List<String> entitiesAcks) {
        Update update = new Update().pull(USERS_ACKS, userName);
        if (entitiesAcks != null) 
            update = update.pullAll(ENTITIES_ACKS, entitiesAcks.toArray());
        update.set(LAST_UPDATE, Instant.now());
        UpdateResult updateFirst = template.updateFirst(Query.query(Criteria.where("uid").is(cardUid)),
                update, Card.class);
        log.debug("removed {} occurrence of {}'s userAcks in the card with uid: {}", updateFirst.getModifiedCount(),
                cardUid);
        return toUserBasedOperationResult(updateFirst);
    }

    public UserBasedOperationResult deleteUserRead(String userName, String cardUid) {
        UpdateResult updateFirst = template.updateFirst(Query.query(Criteria.where("uid").is(cardUid)),
                new Update().pull(USERS_READS, userName).set(LAST_UPDATE, Instant.now()), Card.class);
        log.debug("removed {} occurrence of {}'s usersReads in the card with uid: {}", updateFirst.getModifiedCount(),
                cardUid);
        return toUserBasedOperationResult(updateFirst);
    }

    private UserBasedOperationResult toUserBasedOperationResult(UpdateResult updateResult) {
        UserBasedOperationResult res = null;
        if (updateResult.getMatchedCount() == 0) {
            res = UserBasedOperationResult.cardNotFound();
        } else {
            res = UserBasedOperationResult.cardFound().operationDone(updateResult.getModifiedCount() > 0);
        }
        return res;
    }

    public List<Card> deleteCardsByEndDateBefore(Instant endDateBefore) {
        Query findCardByEndDateBefore = new Query();
        Criteria endDateCriteria = new Criteria().andOperator(Criteria.where(END_DATE).ne(null),
                Criteria.where(END_DATE).lt(endDateBefore));
        Criteria startDateCriteria = new Criteria().andOperator(Criteria.where(END_DATE).exists(false),
                Criteria.where(START_DATE).lt(endDateBefore));
        findCardByEndDateBefore.addCriteria(new Criteria().orOperator(endDateCriteria, startDateCriteria));
        findCardByEndDateBefore.fields().exclude("data");
        List<Card> toDelete = template.find(findCardByEndDateBefore, Card.class);
        template.remove(findCardByEndDateBefore, Card.class);
        return toDelete;
    }

    public List<Card> findCardsByExpirationDate(Instant expirationDate) {
        Query findCardByExpirationDate = new Query();
        Criteria expirationDateCriteria = new Criteria().andOperator(Criteria.where("expirationDate").ne(null),
                Criteria.where("expirationDate").lt(expirationDate));
        findCardByExpirationDate.fields().exclude("data");
        findCardByExpirationDate.addCriteria(expirationDateCriteria);
        return template.find(findCardByExpirationDate, Card.class);
    }

    public UserBasedOperationResult deleteAcksAndReads(String cardUid) {
        Update update = new Update()
            .unset(USERS_ACKS)
            .unset(USERS_READS)
            .set(ENTITIES_ACKS,new LinkedList<String>())
            .set(LAST_UPDATE, Instant.now())
            .set("publishDate", Instant.now())
            .pull("actions", "NOT_NOTIFIED");
        UpdateResult updateFirst = template.updateFirst(Query.query(Criteria.where("uid").is(cardUid)),
                update, Card.class);
        log.debug("removed {} occurrence of Acks and read in the card with uid: {}", updateFirst.getModifiedCount(),
                cardUid);
        return toUserBasedOperationResult(updateFirst);
    }

}
