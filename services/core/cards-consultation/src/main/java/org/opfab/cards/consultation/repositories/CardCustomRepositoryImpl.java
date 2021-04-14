/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.repositories;

import lombok.extern.slf4j.Slf4j;
import org.opfab.cards.consultation.model.CardConsultationData;
import org.opfab.cards.consultation.model.CardOperation;
import org.opfab.cards.consultation.model.CardOperationConsultationData;
import org.opfab.cards.consultation.model.LightCardConsultationData;
import org.opfab.cards.model.CardOperationTypeEnum;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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

    public Flux<CardConsultationData> findByParentCardId(String parentId) {
        return findByParentCardId(template, parentId, CardConsultationData.class);
    }

	public Flux<CardConsultationData> findByInitialParentCardUid(String initialParentCardUid) {
		return findByInitialParentCardUid(template, initialParentCardUid, CardConsultationData.class);
	}


	@Override
	public Flux<CardOperation> getCardOperations(Instant publishFrom, Instant rangeStart, Instant rangeEnd,
	CurrentUserWithPerimeters currentUserWithPerimeters)
	{
		return findCards(publishFrom, rangeStart, rangeEnd, currentUserWithPerimeters).map(lightCard -> {
			CardOperationConsultationData.CardOperationConsultationDataBuilder builder = CardOperationConsultationData.builder();
			return builder.publishDate(lightCard.getPublishDate())
					.type(CardOperationTypeEnum.ADD)
					.card(LightCardConsultationData.copy(lightCard))
					.build();				
		});
	}
	
    private Flux<CardConsultationData> findCards(Instant publishFrom, Instant rangeStart, Instant rangeEnd,
	CurrentUserWithPerimeters currentUserWithPerimeters)
	{	
		Criteria criteria ;
		if (publishFrom != null) 
		{
			if ((rangeEnd!=null) || (rangeStart!=null))criteria = new Criteria().andOperator(publishDateCriteria(publishFrom),
													  										computeCriteriaForUser(currentUserWithPerimeters),
													  										getCriteriaForRange(rangeStart,rangeEnd));  
			else criteria = new Criteria().andOperator(publishDateCriteria(publishFrom),
														computeCriteriaForUser(currentUserWithPerimeters));  
		}
		else criteria = new Criteria().andOperator(computeCriteriaForUser(currentUserWithPerimeters),
													  getCriteriaForRange(rangeStart,rangeEnd));


		Query query = new Query();
		query.fields().exclude("data");

		Criteria criteriaForProcessesStatesNotNotified = computeCriteriaForProcessesStatesNotNotified(currentUserWithPerimeters);

        query.addCriteria(criteria);
        query.addCriteria(criteriaForProcessesStatesNotNotified);
        log.debug("launch query with user {}", currentUserWithPerimeters.getUserData().getLogin());
        return template.find(query, CardConsultationData.class).map(card -> {
            log.debug("Find card {}",card.getId());
			card.setHasBeenAcknowledged(card.getUsersAcks() != null && card.getUsersAcks().contains(currentUserWithPerimeters.getUserData().getLogin()));
			card.setHasBeenRead(card.getUsersReads() != null && card.getUsersReads().contains(currentUserWithPerimeters.getUserData().getLogin()));
			return card;
		});

	}

	private Criteria computeCriteriaForProcessesStatesNotNotified(CurrentUserWithPerimeters currentUserWithPerimeters) {
		List<String> processesStatesNotNotifiedList = new ArrayList<>();
		Map<String, List<String>> processesStatesNotNotifiedMap = currentUserWithPerimeters.getProcessesStatesNotNotified();

		if (processesStatesNotNotifiedMap != null) {
			processesStatesNotNotifiedMap.keySet().forEach(process ->
				processesStatesNotNotifiedMap.get(process).forEach(state ->
					processesStatesNotNotifiedList.add(process + "." + state)
				)
			);
		}
		return where(PROCESS_STATE_KEY).not().in(processesStatesNotNotifiedList);
	}

	private Criteria getCriteriaForRange(Instant rangeStart,Instant rangeEnd)
	{	
		if (rangeStart==null) return where(END_DATE_FIELD).lte(rangeEnd);
		if (rangeEnd==null) return new Criteria().orOperator(
			where(END_DATE_FIELD).gte(rangeStart),
			where(START_DATE_FIELD).gte(rangeStart)
		);
		return new Criteria().orOperator(
			where(START_DATE_FIELD).gte(rangeStart).lte(rangeEnd),
			where(END_DATE_FIELD).gte(rangeStart).lte(rangeEnd),
			new Criteria().andOperator(
				where(START_DATE_FIELD).lte(rangeStart),
				where(END_DATE_FIELD).gte(rangeEnd))
			);
	}

	private Criteria publishDateCriteria(Instant publishFrom) {
		return where(PUBLISH_DATE_FIELD).gte(publishFrom);
	}
}
