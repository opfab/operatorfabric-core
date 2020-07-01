/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.lfenergy.operatorfabric.cards.publication.services;

import org.lfenergy.operatorfabric.cards.publication.model.ArchivedCardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import com.mongodb.client.result.UpdateResult;

import lombok.extern.slf4j.Slf4j;

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

    public Optional<CardPublicationData> findByUid(String uid) {
        Query query = new Query();
        query.addCriteria(Criteria.where("uid").is(uid));
        return Optional.ofNullable(template.findOne(query, CardPublicationData.class));
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

    public CardPublicationData findCardToDelete(String processInstanceId) {
        /**
         * Uses a projection instead the default 'findById' method. This projection
         * excludes data which can be unpredictably huge depending on publisher needs.
         */
        Query findCardByIdWithoutDataField = new Query();
        findCardByIdWithoutDataField.fields().exclude("data");
        findCardByIdWithoutDataField.addCriteria(Criteria.where("Id").is(processInstanceId));

        return this.template.findOne(findCardByIdWithoutDataField, CardPublicationData.class);
    }

	public UserAckOperationResult addUserAck(String name, String cardUid) {
		UpdateResult updateFirst = template.updateFirst(Query.query(Criteria.where("uid").is(cardUid)), 
				new Update().addToSet("usersAcks", name),CardPublicationData.class);
		log.debug("added {} occurrence of {}'s userAcks in the card with uid: {}", updateFirst.getModifiedCount(),
				cardUid);
		return toUserAckOperationResult(updateFirst);
	}

	public UserAckOperationResult deleteUserAck(String userName, String cardUid) {
		UpdateResult updateFirst = template.updateFirst(Query.query(Criteria.where("uid").is(cardUid)),
				new Update().pull("usersAcks", userName), CardPublicationData.class);
		log.debug("removed {} occurrence of {}'s userAcks in the card with uid: {}", updateFirst.getModifiedCount(),
				cardUid);
		return toUserAckOperationResult(updateFirst);
	}
	
	private UserAckOperationResult toUserAckOperationResult(UpdateResult updateResult) {
		UserAckOperationResult res = null;
		if (updateResult.getMatchedCount() == 0) {
			res = UserAckOperationResult.cardNotFound();
		} else {
			res = UserAckOperationResult.cardFound().operationDone(updateResult.getModifiedCount() > 0);
		}
		return res;
	}
    
    

}
