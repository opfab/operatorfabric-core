/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.lfenergy.operatorfabric.cards.consultation.repositories;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.consultation.model.CardOperation;
import org.lfenergy.operatorfabric.cards.consultation.model.CardConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.model.CardOperationConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.model.LightCardConsultationData;
import org.lfenergy.operatorfabric.cards.model.CardOperationTypeEnum;
import org.lfenergy.operatorfabric.users.model.CurrentUserWithPerimeters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.springframework.data.mongodb.core.query.Criteria.where;

@Slf4j
public class CardCustomRepositoryImpl implements CardCustomRepository {


	private static final String PUBLISH_DATE_FIELD = "publishDate";
	private static final String START_DATE_FIELD = "startDate";
	private static final String END_DATE_FIELD = "endDate";

    private final ReactiveMongoTemplate template;


    @Autowired
    public CardCustomRepositoryImpl(ReactiveMongoTemplate template) {
        this.template = template;
    }

    public Mono<CardConsultationData> findByIdWithUser(String id, CurrentUserWithPerimeters currentUserWithPerimeters) {
        return findByIdWithUser(template, id, currentUserWithPerimeters, CardConsultationData.class);
    }

    public Flux<CardConsultationData> findByParentCardUid(String parentUid) {
        return findByParentCardUid(template, parentUid, CardConsultationData.class);
    }


	@Override
	public Flux<CardOperation> getCardOperations(Instant latestPublication, Instant rangeStart, Instant rangeEnd,
	CurrentUserWithPerimeters currentUserWithPerimeters)
	{
		return findCards(latestPublication, rangeStart, rangeEnd, currentUserWithPerimeters).map(lightCard -> {
			CardOperationConsultationData.CardOperationConsultationDataBuilder builder = CardOperationConsultationData.builder();
			return builder.publishDate(lightCard.getPublishDate())
					.type(CardOperationTypeEnum.ADD)
					.card(LightCardConsultationData.copy(lightCard))
					.build();				
		});
	}
	
    private Flux<CardConsultationData> findCards(Instant latestPublication, Instant rangeStart, Instant rangeEnd,
	CurrentUserWithPerimeters currentUserWithPerimeters)
	{	
        Criteria criteria = new Criteria().andOperator(publishDateCriteria(latestPublication),
                                                      computeCriteriaForUser(currentUserWithPerimeters),
                                                      getCriteriaForRange(rangeStart,rangeEnd));

		Query query = new Query();
		query.fields().exclude("data");
        query.addCriteria(criteria);
        log.info("launch query with user " +currentUserWithPerimeters.getUserData().getLogin());
        return template.find(query, CardConsultationData.class).map(card -> {
            log.info("Find card " + card.getId());
			card.setHasBeenAcknowledged(card.getUsersAcks() != null && card.getUsersAcks().contains(currentUserWithPerimeters.getUserData().getLogin()));
			return card;
		});

	}

	private Criteria getCriteriaForRange(Instant rangeStart,Instant rangeEnd)
	{
		
		if (rangeStart==null) return where(END_DATE_FIELD).lt(rangeEnd);
		if (rangeEnd==null) return where(START_DATE_FIELD).gt(rangeStart);
		return new Criteria().orOperator(where(START_DATE_FIELD).gte(rangeStart).lte(rangeEnd),
		where(END_DATE_FIELD).gte(rangeStart).lte(rangeEnd),
		new Criteria().andOperator(where(START_DATE_FIELD).lt(rangeStart), new Criteria()
				.orOperator(where(END_DATE_FIELD).is(null), where(END_DATE_FIELD).gt(rangeEnd))));
	}


	private Criteria publishDateCriteria(Instant latestPublication) {
		return where(PUBLISH_DATE_FIELD).lte(latestPublication);
	}




}
