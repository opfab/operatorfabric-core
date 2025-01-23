/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.repositories;

import lombok.extern.slf4j.Slf4j;

import org.opfab.cards.consultation.model.Card;
import org.opfab.cards.consultation.model.CardOperation;
import org.opfab.cards.consultation.model.CardOperationTypeEnum;
import org.opfab.cards.consultation.model.CardsFilter;
import org.opfab.springtools.configuration.mongo.PaginationUtils;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.PermissionEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOptions;
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
	private static final String LAST_UPDATE_FIELD = "lastUpdate";

    private final ReactiveMongoTemplate template;


    public CardCustomRepositoryImpl(ReactiveMongoTemplate template) {
        this.template = template;
    }

    public Mono<Card> findByIdWithUser(String id, CurrentUserWithPerimeters currentUserWithPerimeters) {
        return findByIdWithUser(template, id, currentUserWithPerimeters, Card.class);
    }

    public Flux<Card> findByParentCardId(String parentId) {
        return findByParentCardId(template, parentId, Card.class);
    }

	public Flux<Card> findByInitialParentCardUid(String initialParentCardUid) {
		return findByInitialParentCardUid(template, initialParentCardUid, Card.class);
	}


	@Override
	public Flux<CardOperation> getCardOperations(Instant updatedFrom, Instant rangeStart, Instant rangeEnd, 
	CurrentUserWithPerimeters currentUserWithPerimeters)
	{
		return findCards(updatedFrom, rangeStart, rangeEnd, currentUserWithPerimeters).map(lightCard ->
			new CardOperation(CardOperationTypeEnum.ADD, null, lightCard)
		);
	}
	
    private Flux<Card> findCards(Instant updatedFrom, Instant rangeStart, Instant rangeEnd,
	CurrentUserWithPerimeters currentUserWithPerimeters)
	{	
		Criteria criteria ;
		if (updatedFrom != null) 
		{
			if ((rangeEnd != null) || (rangeStart != null))criteria =
					new Criteria().andOperator(updateDateCriteria(updatedFrom),
						computeCriteriaForUser(currentUserWithPerimeters, false),
						getCriteriaForRange(rangeStart, rangeEnd));
			else criteria = new Criteria().andOperator(updateDateCriteria(updatedFrom),
					computeCriteriaForUser(currentUserWithPerimeters, false));
		}
		else criteria = new Criteria().andOperator(computeCriteriaForUser(currentUserWithPerimeters, false),
													  getCriteriaForRange(rangeStart, rangeEnd));


		Query query = new Query();
		query.fields().exclude("data");

		Criteria criteriaForProcessesStatesNotNotified = computeCriteriaForProcessesStatesNotNotified(currentUserWithPerimeters);

        query.addCriteria(criteria);
        query.addCriteria(criteriaForProcessesStatesNotNotified);
        log.debug("launch query with user {}", currentUserWithPerimeters.getUserData().getLogin());
        return template.find(query, Card.class).map(card -> {
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

	private Criteria getCriteriaForRange(Instant rangeStart, Instant rangeEnd)
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

	private Criteria updateDateCriteria(Instant updatedFrom) {
		return Criteria.where(LAST_UPDATE_FIELD).gte(updatedFrom);
	}


    public Mono<Page<Object>> findWithUserAndFilter(
            Tuple2<CurrentUserWithPerimeters, CardsFilter> filter) {
		CardsFilter queryFilter = filter.getT2();

		if ((queryFilter.selectedFields() != null) && (!queryFilter.selectedFields().isEmpty())) {
			return findWithUserAndFilterAndSelectedFields(filter);
		}

        Pageable pageableRequest = PaginationUtils.createPageable(queryFilter.page() != null ? queryFilter.page().intValue() : null , queryFilter.size() != null ? queryFilter.size().intValue() : null);
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
		"usersReads",
		"userRecipients",
		"groupRecipients",
	};
        Aggregation agg = newAggregation( this.getFilterOperations(filter,pageableRequest, fields));
        Aggregation countAgg = newAggregation( this.getFilterOperationsForCount(filter));

        if (pageableRequest.isPaged()) {
            return template.aggregate(agg, CARDS_COLLECTION, Card.class)
                    .cast(Object.class).collectList()
                    .zipWith(template.aggregate(countAgg, CARDS_COLLECTION, String.class)
                            .defaultIfEmpty("{\"count\":0}")
                            .single())
                    .map(tuple -> new PageImpl<>(tuple.getT1(), pageableRequest, PaginationUtils.getCountFromJson(tuple.getT2())));
        } else {
            return template.aggregate(agg, CARDS_COLLECTION, Card.class)
                    .cast(Object.class).collectList()
                    .map(PageImpl::new);
        }
	}

	public Mono<Page<Object>> findWithUserAndFilterAndSelectedFields(
			Tuple2<CurrentUserWithPerimeters, CardsFilter> filter) {
		CardsFilter queryFilter = filter.getT2();

		Pageable pageableRequest = PaginationUtils.createPageable(queryFilter.page() != null ? queryFilter.page().intValue() : null , queryFilter.size() != null ? queryFilter.size().intValue() : null);
		List<String> fields = new ArrayList<>(List.of(
				"uid",
				"severity"));

		fields.addAll(queryFilter.selectedFields());
		List<String> fieldsWithoutDuplicates = fields.stream().distinct().toList();
		String[] selectedFields = fieldsWithoutDuplicates.toArray(String[]::new);

		Aggregation agg = newAggregation(this.getFilterOperations(filter, pageableRequest, selectedFields));
		agg = agg.withOptions(AggregationOptions.builder().strictMapping().build());
		Aggregation countAgg = newAggregation(this.getFilterOperationsForCount(filter));

		if (pageableRequest.isPaged()) {
			return template.aggregate(agg, CARDS_COLLECTION, Object.class)
					.collectList()
					.zipWith(template.aggregate(countAgg, CARDS_COLLECTION, String.class)
							.defaultIfEmpty("{\"count\":0}")
							.single())
					.map(tuple -> new PageImpl<>(tuple.getT1(), pageableRequest, PaginationUtils.getCountFromJson(tuple.getT2())));
		} else {
			return template.aggregate(agg, CARDS_COLLECTION, Object.class)
					.collectList()
					.map(PageImpl::new);
		}
	}


    public boolean checkIfInAdminMode(CurrentUserWithPerimeters currentUserWithPerimeters,
            CardsFilter filter) {
        if (filter.adminMode() != null) {
            boolean adminMode = Boolean.TRUE.equals(filter.adminMode());

            boolean hasCurrentUserAdminPermission = hasCurrentUserAnyPermission(currentUserWithPerimeters,
                    PermissionEnum.ADMIN, PermissionEnum.VIEW_ALL_CARDS);

            if (adminMode && !hasCurrentUserAdminPermission)
                log.warn("Parameter {} set to true in the request but the user is not member of ADMIN group",
                        ADMIN_MODE);

            return (hasCurrentUserAdminPermission) && adminMode;
        }
        return false;
    }

}
