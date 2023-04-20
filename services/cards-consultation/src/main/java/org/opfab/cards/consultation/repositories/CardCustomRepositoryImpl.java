/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.repositories;

import lombok.extern.slf4j.Slf4j;

import org.opfab.cards.consultation.model.CardsFilter;
import org.opfab.cards.consultation.model.CardConsultationData;
import org.opfab.cards.consultation.model.CardOperation;
import org.opfab.cards.consultation.model.CardOperationConsultationData;
import org.opfab.cards.consultation.model.LightCard;
import org.opfab.cards.consultation.model.LightCardConsultationData;
import org.opfab.cards.model.CardOperationTypeEnum;
import org.opfab.springtools.configuration.mongo.PaginationUtils;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.PermissionEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;


@Slf4j
public class CardCustomRepositoryImpl implements CardCustomRepository {

	private static final String CARDS_COLLECTION = "cards";


	private static final String PUBLISH_DATE_FIELD = "publishDate";
	private static final String START_DATE_FIELD = "startDate";
	private static final String END_DATE_FIELD = "endDate";

	private static final String LAST_ACK_DATE_FIELD = "lastAckDate";
    private final ReactiveMongoTemplate template;


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
			return builder
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
		if (rangeStart==null) return  new Criteria().orOperator(
			where(END_DATE_FIELD).lte(rangeEnd),
			where(PUBLISH_DATE_FIELD).lte(rangeEnd)
		);
		if (rangeEnd==null) return new Criteria().orOperator(
			where(END_DATE_FIELD).gte(rangeStart),
			where(START_DATE_FIELD).gte(rangeStart),
			where(PUBLISH_DATE_FIELD).gte(rangeStart)
		);
		return new Criteria().orOperator(
			where(START_DATE_FIELD).gte(rangeStart).lte(rangeEnd),
			where(END_DATE_FIELD).gte(rangeStart).lte(rangeEnd),
			new Criteria().andOperator(
				where(START_DATE_FIELD).lte(rangeStart),
				where(END_DATE_FIELD).gte(rangeEnd)
			),
			where(PUBLISH_DATE_FIELD).gte(rangeStart).lte(rangeEnd)
		);
	}

	private Criteria publishDateCriteria(Instant publishFrom) {
		Criteria publishCriteria = new Criteria();
		publishCriteria.orOperator(where(PUBLISH_DATE_FIELD).gte(publishFrom),
				where(LAST_ACK_DATE_FIELD).gte(publishFrom));
		return publishCriteria;
	}


    public Mono<Page<LightCard>> findWithUserAndFilter(
            Tuple2<CurrentUserWithPerimeters, CardsFilter> filter) {
		CardsFilter queryFilter = filter.getT2();
        log.info("findWithUserAndFilter" + queryFilter);

        Pageable pageableRequest = PaginationUtils.createPageable(queryFilter.getPage() != null ? queryFilter.getPage().intValue() : null , queryFilter.getSize() != null ? queryFilter.getSize().intValue() : null);
        String[] fields = {"uid",
        "publisher",
        "processVersion",
        PROCESS_FIELD,
        PROCESS_INSTANCE_ID_FIELD,
        "state",
        "titleTranslated",
        "summaryTranslated",
        PUBLISH_DATE_FIELD,
        START_DATE_FIELD,
        END_DATE_FIELD,
        "severity",
        "publisherType",
        "representative",
        "representativeType",
		"entityRecipients",
		"entityRecipientsForInformation",
        "entitiesAcks",
		"userRecipients",
		"groupRecipients",
	};
        Aggregation agg = newAggregation( this.getFilterOperations(filter,pageableRequest, fields));
        Aggregation countAgg = newAggregation( this.getFilterOperationsForCount(filter));

        if (pageableRequest.isPaged()) {
            return template.aggregate(agg, CARDS_COLLECTION, LightCardConsultationData.class)
                    .cast(LightCard.class).collectList()
                    .zipWith(template.aggregate(countAgg, CARDS_COLLECTION, String.class)
                            .defaultIfEmpty("{\"count\":0}")
                            .single())
                    .map(tuple -> new PageImpl<>(tuple.getT1(), pageableRequest, PaginationUtils.getCountFromJson(tuple.getT2())));
        } else {
            return template.aggregate(agg, CARDS_COLLECTION, LightCardConsultationData.class)
                    .cast(LightCard.class).collectList()
                    .map(PageImpl::new);
        }
	}


    public boolean checkIfInAdminMode(CurrentUserWithPerimeters currentUserWithPerimeters,
            CardsFilter filter) {
        if (filter.getAdminMode() != null) {
            boolean adminMode = Boolean.TRUE.equals(filter.getAdminMode());
            boolean isCurrentUserMemberOfAdminGroup = ((currentUserWithPerimeters.getUserData().getGroups() != null) &&
                    (currentUserWithPerimeters.getUserData().getGroups().contains("ADMIN")));

            boolean hasCurrentUserAdminPermission = hasCurrentUserAnyPermission(currentUserWithPerimeters,
                    PermissionEnum.ADMIN, PermissionEnum.VIEW_ALL_CARDS);

            if (adminMode && !isCurrentUserMemberOfAdminGroup &&
                    !hasCurrentUserAdminPermission)
                log.warn("Parameter {} set to true in the request but the user is not member of ADMIN group",
                        ADMIN_MODE);

            return (isCurrentUserMemberOfAdminGroup || hasCurrentUserAdminPermission) && adminMode;
        }
        return false;
    }

}
