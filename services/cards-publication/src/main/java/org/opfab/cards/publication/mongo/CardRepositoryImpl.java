/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
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

import org.opfab.cards.publication.model.ArchivedCardPublicationData;
import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.cards.publication.repositories.CardRepository;
import org.opfab.cards.publication.repositories.UserBasedOperationResult;
import org.opfab.users.model.User;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;


import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import static org.springframework.data.mongodb.core.query.Criteria.where;

@Slf4j
public class CardRepositoryImpl implements CardRepository {

    private MongoTemplate template;

    static final String END_DATE = "endDate";
    static final String USERS_ACKS = "usersAcks";
    static final String USERS_READS = "usersReads";

    public CardRepositoryImpl(MongoTemplate template) {
        this.template = template;
    }

    public Optional<CardPublicationData> findByUid(String uid) {
        Query query = new Query();
        query.addCriteria(Criteria.where("uid").is(uid));
        return Optional.ofNullable(template.findOne(query, CardPublicationData.class));
    }

    public Optional<ArchivedCardPublicationData> findArchivedCardByUid(String uid) {
        Query query = new Query();
        query.addCriteria(Criteria.where("id").is(uid));
        return Optional.ofNullable(template.findOne(query, ArchivedCardPublicationData.class));
    }

    public void saveCard(CardPublicationData card) {
        log.debug("preparing to write {}", card.toString());
        template.save(card);
    }

    public void saveCardToArchive(ArchivedCardPublicationData card) {
        // Update deletionDate on previous version of this card in archives
        Query query = new Query();
        query.addCriteria(new Criteria().andOperator(
                where("process").is(card.getProcess()),
                where("processInstanceId").is(card.getProcessInstanceId()),
                where("deletionDate").isNull()));
        template.updateFirst(query, Update.update("deletionDate", card.getPublishDate()),
                ArchivedCardPublicationData.class);
        this.template.insert(card);
    }

    public void deleteCard(CardPublicationData cardToDelete) {
        this.template.remove(cardToDelete);
    }

    public void updateArchivedCard(ArchivedCardPublicationData card) {
        this.template.save(card);
    }

    public CardPublicationData findCardById(String id) {
        /**
         * Uses a projection instead the default 'findById' method. This projection
         * excludes data which can be unpredictably huge depending on publisher needs.
         */
        Query findCardByIdWithoutDataField = new Query();
        findCardByIdWithoutDataField.fields().exclude("data");
        findCardByIdWithoutDataField.addCriteria(Criteria.where("Id").is(id));

        return this.template.findOne(findCardByIdWithoutDataField, CardPublicationData.class);
    }

    public Optional<List<CardPublicationData>> findChildCard(CardPublicationData card) {
        if (Objects.isNull(card))
            return Optional.empty();

        Query findCardByParentCardIdWithoutDataField = new Query();
        findCardByParentCardIdWithoutDataField.fields().exclude("data");
        findCardByParentCardIdWithoutDataField.addCriteria(Criteria.where("parentCardId").is(card.getId()));
        return Optional.ofNullable(template.find(findCardByParentCardIdWithoutDataField, CardPublicationData.class));
    }

    public UserBasedOperationResult addUserAck(User user, String cardUid, List<String> entitiesAcks) {
        Update update = new Update().addToSet(USERS_ACKS, user.getLogin());
        update.addToSet(
                "entitiesAcks",
                BasicDBObjectBuilder.start("$each", entitiesAcks).get());
        update.set("lastAckDate", Instant.now());

        UpdateResult updateFirst = template.updateFirst(Query.query(Criteria.where("uid").is(cardUid)),
                update,
                CardPublicationData.class);
        log.debug("added {} occurrence of {}'s userAcks in the card with uid: {}", updateFirst.getModifiedCount(),
                cardUid);
        return toUserBasedOperationResult(updateFirst);
    }

    public UserBasedOperationResult addUserRead(String name, String cardUid) {
        UpdateResult updateFirst = template.updateFirst(Query.query(Criteria.where("uid").is(cardUid)),
                new Update().addToSet(USERS_READS, name), CardPublicationData.class);
        log.debug("added {} occurrence of {}'s userReads in the card with uid: {}", updateFirst.getModifiedCount(),
                cardUid);
        return toUserBasedOperationResult(updateFirst);
    }

    public UserBasedOperationResult deleteUserAck(String userName, String cardUid) {
        UpdateResult updateFirst = template.updateFirst(Query.query(Criteria.where("uid").is(cardUid)),
                new Update().pull(USERS_ACKS, userName), CardPublicationData.class);
        log.debug("removed {} occurrence of {}'s userAcks in the card with uid: {}", updateFirst.getModifiedCount(),
                cardUid);
        return toUserBasedOperationResult(updateFirst);
    }

    public UserBasedOperationResult deleteUserRead(String userName, String cardUid) {
        UpdateResult updateFirst = template.updateFirst(Query.query(Criteria.where("uid").is(cardUid)),
                new Update().pull(USERS_READS, userName), CardPublicationData.class);
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

    public List<CardPublicationData> deleteCardsByEndDateBefore(Instant endDateBefore) {
        Query findCardByEndDateBefore = new Query();
        Criteria endDateCriteria = new Criteria().andOperator(Criteria.where(END_DATE).ne(null),
                Criteria.where(END_DATE).lt(endDateBefore));
        Criteria startDateCriteria = new Criteria().andOperator(Criteria.where(END_DATE).exists(false),
                Criteria.where("startDate").lt(endDateBefore));
        findCardByEndDateBefore.addCriteria(new Criteria().orOperator(endDateCriteria, startDateCriteria));
        findCardByEndDateBefore.fields().exclude("data");
        List<CardPublicationData> toDelete = template.find(findCardByEndDateBefore, CardPublicationData.class);
        template.remove(findCardByEndDateBefore, CardPublicationData.class);
        return toDelete;
    }

    public List<CardPublicationData> findCardsByExpirationDate(Instant expirationDate) {
        Query findCardByExpirationDate = new Query();
        Criteria expirationDateCriteria = new Criteria().andOperator(Criteria.where("expirationDate").ne(null),
                Criteria.where("expirationDate").lt(expirationDate));
        findCardByExpirationDate.fields().exclude("data");
        findCardByExpirationDate.addCriteria(expirationDateCriteria);
        return template.find(findCardByExpirationDate, CardPublicationData.class);
    }

    public UserBasedOperationResult deleteAcksAndReads(String cardUid) {
        UpdateResult updateFirst = template.updateFirst(Query.query(Criteria.where("uid").is(cardUid)),
                new Update().unset(USERS_ACKS).unset(USERS_READS).set("publishDate", Instant.now()), CardPublicationData.class);
        log.debug("removed {} occurrence of userAcks in the card with uid: {}", updateFirst.getModifiedCount(),
                cardUid);
        return toUserBasedOperationResult(updateFirst);
    }

}
