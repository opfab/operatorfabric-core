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
import org.lfenergy.operatorfabric.cards.consultation.model.ArchivedCardConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.model.LightCard;
import org.lfenergy.operatorfabric.cards.consultation.model.LightCardConsultationData;
import org.lfenergy.operatorfabric.users.model.CurrentUserWithPerimeters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.springframework.data.mongodb.core.query.Criteria.where;

@Slf4j
public class ArchivedCardCustomRepositoryImpl implements ArchivedCardCustomRepository {

    public static final String PUBLISH_DATE_FIELD = "publishDate";
    public static final String PUBLISH_DATE_FROM_PARAM = "publishDateFrom";
    public static final String PUBLISH_DATE_TO_PARAM = "publishDateTo";

    public static final String START_DATE_FIELD = "startDate";
    public static final String END_DATE_FIELD = "endDate";
    public static final String ACTIVE_FROM_PARAM = "activeFrom";
    public static final String ACTIVE_TO_PARAM = "activeTo";

    public static final String PAGE_PARAM = "page";
    public static final String PAGE_SIZE_PARAM = "size";

    public static final int DEFAULT_PAGE_SIZE = 10;

    private static final List<String> SPECIAL_PARAMETERS = Arrays.asList(
            PUBLISH_DATE_FROM_PARAM, PUBLISH_DATE_TO_PARAM, ACTIVE_FROM_PARAM, ACTIVE_TO_PARAM, PAGE_PARAM, PAGE_SIZE_PARAM);


    private static final String ARCHIVED_CARDS_COLLECTION = "archivedCards";

    private final ReactiveMongoTemplate template;

    @Autowired
    public ArchivedCardCustomRepositoryImpl(ReactiveMongoTemplate template) {
        this.template = template;
    }

    public Mono<ArchivedCardConsultationData> findByIdWithUser(String id, CurrentUserWithPerimeters currentUserWithPerimeters) {
        return findByIdWithUser(template, id, currentUserWithPerimeters, ArchivedCardConsultationData.class);
    }

    public Flux<ArchivedCardConsultationData> findByParentCardUid(String parentUid) {
        return findByParentCardUid(template, parentUid, ArchivedCardConsultationData.class);
    }

    public Mono<Page<LightCard>> findWithUserAndParams(Tuple2<CurrentUserWithPerimeters, MultiValueMap<String, String>> params) {
        Query query = createQueryFromUserAndParams(params);
        Query countQuery = createQueryFromUserAndParams(params);

        //Handle Paging
        Pageable pageableRequest = createPageableFromParams(params.getT2());
        if (pageableRequest.isPaged()) {
            return template.find(query.with(pageableRequest), LightCardConsultationData.class, ARCHIVED_CARDS_COLLECTION)
                    .cast(LightCard.class).collectList()
                    .zipWith(template.count(countQuery, LightCard.class, ARCHIVED_CARDS_COLLECTION))
                    .map(tuple -> new PageImpl<>(tuple.getT1(), pageableRequest, tuple.getT2()));
        } else {
            return template.find(query, LightCardConsultationData.class, ARCHIVED_CARDS_COLLECTION)
            		.cast(LightCard.class).collectList()
                    .map(results -> new PageImpl<>(results));
        }
        //The class used as a parameter for the find & count methods is LightCard (and not LightCardConsultationData) to make use of the existing LightCardReadConverter
    }

    private Pageable createPageableFromParams(MultiValueMap<String, String> queryParams) {
        if (queryParams.containsKey(PAGE_PARAM) && queryParams.containsKey(PAGE_SIZE_PARAM)) {
            return PageRequest.of(Integer.parseInt(queryParams.getFirst(PAGE_PARAM)), Integer.parseInt(queryParams.getFirst(PAGE_SIZE_PARAM)));
        } else if (queryParams.containsKey(PAGE_PARAM)) {
            //If page number is specified but not size, use default size
            return PageRequest.of(Integer.parseInt(queryParams.getFirst(PAGE_PARAM)), DEFAULT_PAGE_SIZE);
        } else if (queryParams.containsKey(PAGE_SIZE_PARAM)) {
            //If page size is specified but not page number, return first page by default
            return PageRequest.of(0, Integer.parseInt(queryParams.getFirst(PAGE_SIZE_PARAM)));
        } else {
            return Pageable.unpaged();
        }
    }

    private Query createQueryFromUserAndParams(Tuple2<CurrentUserWithPerimeters, MultiValueMap<String, String>> params) {

        Query query = new Query();

        List<Criteria> criteria = new ArrayList<>();

        CurrentUserWithPerimeters currentUserWithPerimeters = params.getT1();
        MultiValueMap<String, String> queryParams = params.getT2();

        query.with(Sort.by(Sort.Order.desc(PUBLISH_DATE_FIELD)));

        /* Handle special parameters */

        // Publish date range
        criteria.addAll(publishDateCriteria(queryParams));

        // Active range
        criteria.addAll(activeRangeCriteria(queryParams));

        /* Handle regular parameters */
        criteria.addAll(regularParametersCriteria(queryParams));

        /* Add user criteria */
        criteria.addAll(computeCriteriaList4User(currentUserWithPerimeters));

        if (!criteria.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[criteria.size()])));
        }

        return query;
    }
    //TODO Catch errors if dates or page param are not parseable as Int?


    private List<Criteria> regularParametersCriteria(MultiValueMap<String, String> params) {

        List<Criteria> criteria = new ArrayList<>();

        params.forEach((key, values) -> {

            if (!SPECIAL_PARAMETERS.contains(key)) {
                criteria.add(Criteria.where(key).in(values));
            }

        });

        return criteria;
    }

    //TODO Note in doc that this assumes params to be unique, otherwise will take first occurrence
    private List<Criteria> publishDateCriteria(MultiValueMap<String, String> params) {

        List<Criteria> criteria = new ArrayList<>();

        if (params.containsKey(PUBLISH_DATE_FROM_PARAM) && params.containsKey(PUBLISH_DATE_TO_PARAM)) {
            criteria.add(Criteria.where(PUBLISH_DATE_FIELD)
                    .gte(Instant.ofEpochMilli(Long.parseLong(params.getFirst(PUBLISH_DATE_FROM_PARAM))))
                    .lte(Instant.ofEpochMilli(Long.parseLong(params.getFirst(PUBLISH_DATE_TO_PARAM)))));
        } else if (params.containsKey(PUBLISH_DATE_FROM_PARAM)) {
            criteria.add(Criteria.where(PUBLISH_DATE_FIELD)
                    .gte(Instant.ofEpochMilli(Long.parseLong(params.getFirst(PUBLISH_DATE_FROM_PARAM)))));
        } else if (params.containsKey(PUBLISH_DATE_TO_PARAM)) {
            criteria.add(Criteria.where(PUBLISH_DATE_FIELD)
                    .lte(Instant.ofEpochMilli(Long.parseLong(params.getFirst(PUBLISH_DATE_TO_PARAM)))));
        }

        return criteria;
    }

    private List<Criteria> activeRangeCriteria(MultiValueMap<String, String> params) {

        List<Criteria> criteria = new ArrayList<>();

        if (params.containsKey(ACTIVE_FROM_PARAM) && params.containsKey(ACTIVE_TO_PARAM)) {
            Instant activeFrom = Instant.ofEpochMilli(Long.parseLong(params.getFirst(ACTIVE_FROM_PARAM)));
            Instant activeTo = Instant.ofEpochMilli(Long.parseLong(params.getFirst(ACTIVE_TO_PARAM)));
            criteria.add(new Criteria().orOperator(
                    //Case 1: Card start date is included in query filter range
                    where(START_DATE_FIELD).gte(activeFrom).lte(activeTo),
                    //Case 2: Card start date is before start of query filter range
                    new Criteria().andOperator(
                            where(START_DATE_FIELD).lte(activeFrom),
                            new Criteria().orOperator(
                                    where(END_DATE_FIELD).is(null),
                                    where(END_DATE_FIELD).gte(activeFrom)
                            )
                    )
            ));
        } else if (params.containsKey(ACTIVE_FROM_PARAM)) {
            Instant activeFrom = Instant.ofEpochMilli(Long.parseLong(params.getFirst(ACTIVE_FROM_PARAM)));
            criteria.add(new Criteria().orOperator(
                    where(END_DATE_FIELD).is(null),
                    where(END_DATE_FIELD).gte(activeFrom)
            ));
        } else if (params.containsKey(ACTIVE_TO_PARAM)) {
            Instant activeTo = Instant.ofEpochMilli(Long.parseLong(params.getFirst(ACTIVE_TO_PARAM)));
            criteria.add(Criteria.where(START_DATE_FIELD).lte(activeTo));
        }

        return criteria;

    }

}
