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
import org.lfenergy.operatorfabric.cards.consultation.model.CardConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.model.CardOperation;
import org.lfenergy.operatorfabric.cards.consultation.model.CardOperationConsultationData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import reactor.core.publisher.Flux;

import javax.annotation.PostConstruct;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.function.Consumer;

import static org.springframework.data.mongodb.core.query.Criteria.where;

@Slf4j
public class CardOperationRepositoryImpl implements CardOperationRepository {

	private static final String ENTITY_RECIPIENTS = "entityRecipients";
	private static final String GROUP_RECIPIENTS = "groupRecipients";
    private static final String PROCESS_STATE_KEY = "processStateKey";
	private static final String ORPHANED_USERS = "orphanedUsers";
	private static final String PUBLISH_DATE_FIELD = "publishDate";
	private static final String START_DATE_FIELD = "startDate";
	private static final String END_DATE_FIELD = "endDate";
	private static final String CARDS_FIELD = "rawCards";
	private static final String TYPE_FIELD = "type";
	private final ReactiveMongoTemplate template;
	private ProjectionOperation projectStage;
	private GroupOperation groupStage;

	@Autowired
	public CardOperationRepositoryImpl(ReactiveMongoTemplate template) {
		this.template = template;
	}

	@PostConstruct
	public void initCommonStages() {
		projectStage = projectToLightCard();
		groupStage = groupByPublishDate();
	}

	@Override
	public Flux<CardOperation> findCards(Instant latestPublication, Instant rangeStart, Instant rangeEnd,
			String login, String[] groups, String[] entities, List<String> processStateList) {
		
		if ((rangeStart==null) && (rangeEnd==null)) return null;
		MatchOperation queryStage = Aggregation.match(new Criteria().andOperator(publishDateCriteria(latestPublication),
				userCriteria(login, groups, entities, processStateList),getCriteriaForRange(rangeStart,rangeEnd)
				));
		TypedAggregation<CardConsultationData> aggregation = Aggregation.newAggregation(CardConsultationData.class,
				queryStage, groupStage, projectStage);
		aggregation.withOptions(AggregationOptions.builder().allowDiskUse(true).build());
		return template.aggregate(aggregation,CardOperationConsultationData.class)
		.doOnNext(transformCardOperationFactory(login)).cast(CardOperation.class);
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

    /*
    Rules for receiving cards :
    1) If the card is sent to entity A and group B, then to receive it,
       the user must be part of A AND (be part of B OR have the right for the process/state of the card)
    2) If the card is sent to entity A only, then to receive it, the user must be part of A and have the right for the process/state of the card
    3) If the card is sent to group B only, then to receive it, the user must be part of B
    */
    private Criteria userCriteria(String login, String[] groups, String[] entities, List<String> processStateList) {
        List<String> groupsList = (groups != null ? Arrays.asList(groups) : new ArrayList<>());
        List<String> entitiesList = (entities != null ? Arrays.asList(entities) : new ArrayList<>());

        return  new Criteria().orOperator(
                where(ORPHANED_USERS).in(login),
                where(GROUP_RECIPIENTS).in(groupsList).andOperator(new Criteria().orOperator(   //card sent to group only
                        Criteria.where(ENTITY_RECIPIENTS).exists(false), Criteria.where(ENTITY_RECIPIENTS).size(0))),
                where(ENTITY_RECIPIENTS).in(entitiesList).andOperator(new Criteria().orOperator(    //card sent to entity only
                        Criteria.where(GROUP_RECIPIENTS).exists(false), Criteria.where(GROUP_RECIPIENTS).size(0)),
                        Criteria.where(PROCESS_STATE_KEY).in(processStateList)),
                where(ENTITY_RECIPIENTS).in(entitiesList).and(GROUP_RECIPIENTS).in(groupsList),    //card sent to group and entity
                where(ENTITY_RECIPIENTS).in(entitiesList).and(PROCESS_STATE_KEY).in(processStateList));  //card sent to group and entity
    }

	private Criteria publishDateCriteria(Instant latestPublication) {
		return where(PUBLISH_DATE_FIELD).lte(latestPublication);
	}


	private ProjectionOperation projectToLightCard() {
		return Aggregation.project(CARDS_FIELD).andExpression("_id").as(PUBLISH_DATE_FIELD).andExpression("[0]", "ADD")
				.as(TYPE_FIELD);
	}

	private GroupOperation groupByPublishDate() {
		return Aggregation.group(PUBLISH_DATE_FIELD).push(Aggregation.ROOT).as(CARDS_FIELD);
	}

	private Consumer<CardOperationConsultationData> transformCardOperationFactory(String login) {
		return cardOperation -> cardOperation.getRawCards().forEach(lightCard -> lightCard.setHasBeenAcknowledged(
				lightCard.getUsersAcks() != null && lightCard.getUsersAcks().contains(login)));
	}
}
