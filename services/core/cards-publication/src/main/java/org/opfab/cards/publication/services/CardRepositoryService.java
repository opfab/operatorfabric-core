/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.publication.services;

import com.mongodb.client.result.DeleteResult;
import com.mongodb.client.result.UpdateResult;
import lombok.extern.slf4j.Slf4j;

import org.opfab.cards.model.CardOperationTypeEnum;
import org.opfab.cards.publication.model.ArchivedCardPublicationData;
import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * 
 * Responsible of Write of Cards in card and archiveCard mongo collection
 * 
 */
@Service
@Slf4j
public class CardRepositoryService {

    @Autowired
    private MongoTemplate template;

    @Autowired
    private CardNotificationService cardNotificationService;

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
        this.template.insert(card);
    }

    public void deleteCard(CardPublicationData cardToDelete) {
        this.template.remove(cardToDelete);
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
        if (Objects.isNull(card)) return Optional.empty();

        Query findCardByParentCardIdWithoutDataField = new Query();
        findCardByParentCardIdWithoutDataField.fields().exclude("data");
        findCardByParentCardIdWithoutDataField.addCriteria(Criteria.where("parentCardId").is(card.getId()));
        return Optional.ofNullable(template.find(findCardByParentCardIdWithoutDataField, CardPublicationData.class));
    }

	public UserBasedOperationResult addUserAck(User user, String cardUid) {
		UpdateResult updateFirst = template.updateFirst(Query.query(Criteria.where("uid").is(cardUid)), 
				new Update().addToSet("usersAcks", user.getLogin()),CardPublicationData.class);
		log.debug("added {} occurrence of {}'s userAcks in the card with uid: {}", updateFirst.getModifiedCount(),
				cardUid);
		return toUserBasedOperationResult(updateFirst);
	}
	
	public UserBasedOperationResult addUserRead(String name, String cardUid) {
		UpdateResult updateFirst = template.updateFirst(Query.query(Criteria.where("uid").is(cardUid)), 
				new Update().addToSet("usersReads", name),CardPublicationData.class);
		log.debug("added {} occurrence of {}'s userReads in the card with uid: {}", updateFirst.getModifiedCount(),
				cardUid);
		return toUserBasedOperationResult(updateFirst);
	}

	public UserBasedOperationResult deleteUserAck(String userName, String cardUid) {
		UpdateResult updateFirst = template.updateFirst(Query.query(Criteria.where("uid").is(cardUid)),
				new Update().pull("usersAcks", userName), CardPublicationData.class);
		log.debug("removed {} occurrence of {}'s userAcks in the card with uid: {}", updateFirst.getModifiedCount(),
				cardUid);
		return toUserBasedOperationResult(updateFirst);
	}

    public UserBasedOperationResult deleteUserRead(String userName, String cardUid) {
		UpdateResult updateFirst = template.updateFirst(Query.query(Criteria.where("uid").is(cardUid)),
				new Update().pull("usersReads", userName), CardPublicationData.class);
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

    public DeleteResult deleteCardsByEndDateBefore(Instant endDateBefore) {
        Query findCardByEndDateBefore = new Query();
        Criteria endDateCriteria = new Criteria().andOperator(Criteria.where("endDate").ne(null), Criteria.where("endDate").lt(endDateBefore));
        Criteria startDateCriteria = new Criteria().andOperator(Criteria.where("endDate").exists(false), Criteria.where("startDate").lt(endDateBefore));

        findCardByEndDateBefore.addCriteria(new Criteria().orOperator(endDateCriteria, startDateCriteria));
        List<CardPublicationData> toDelete = template.find(findCardByEndDateBefore, CardPublicationData.class);
        toDelete.stream().forEach(cardToDelete -> cardNotificationService.notifyOneCard(cardToDelete, CardOperationTypeEnum.DELETE));
        return template.remove(findCardByEndDateBefore, CardPublicationData.class);
    }
}
