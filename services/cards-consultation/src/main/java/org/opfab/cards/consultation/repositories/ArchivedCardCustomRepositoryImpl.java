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
import org.opfab.cards.consultation.model.*;
import org.opfab.cards.consultation.model.ArchivedCard;
import org.opfab.springtools.configuration.mongo.PaginationUtils;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.PermissionEnum;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;
import static org.springframework.data.mongodb.core.query.Criteria.where;

@Slf4j
public class ArchivedCardCustomRepositoryImpl implements ArchivedCardCustomRepository {

    public static final String PUBLISH_DATE_FIELD = "publishDate";
    public static final String START_DATE_FIELD = "startDate";
    public static final String END_DATE_FIELD = "endDate";
    public static final String PROCESS_FIELD = "process";
    public static final String PROCESS_INSTANCE_ID_FIELD = "processInstanceId";
    public static final String DELETION_DATE_FIELD = "deletionDate";
    public static final String PUBLISH_DATE_FROM_PARAM = "publishDateFrom";
    public static final String PUBLISH_DATE_TO_PARAM = "publishDateTo";
    public static final String ACTIVE_FROM_PARAM = "activeFrom";
    public static final String ACTIVE_TO_PARAM = "activeTo";
    public static final String PAGE_PARAM = "page";
    public static final String PAGE_SIZE_PARAM = "size";
    public static final String PARENT_CARD_ID_FIELD = "parentCardId";
    public static final String CHILD_CARDS_PARAM = "childCards";
    public static final String LATEST_UPDATE_ONLY = "latestUpdateOnly";
    public static final String ADMIN_MODE = "adminMode";
    public static final String COUNT = "count";
    public static final int DEFAULT_PAGE_SIZE = 10;
    private static final String ARCHIVED_CARDS_COLLECTION = "archivedCards";

    private final ReactiveMongoTemplate template;

    public ArchivedCardCustomRepositoryImpl(ReactiveMongoTemplate template) {
        this.template = template;
    }

    public Mono<ArchivedCard> findByIdWithUser(String id, CurrentUserWithPerimeters currentUserWithPerimeters) {
        return findByIdWithUser(template, id, currentUserWithPerimeters, ArchivedCard.class);
    }

    public Flux<ArchivedCard> findByParentCardId(String parentId) {
        return findByParentCardId(template, parentId, ArchivedCard.class);
    }

    public Flux<ArchivedCard> findByInitialParentCardUid(String initialParentCardUid) {
        return findByInitialParentCardUid(template, initialParentCardUid, ArchivedCard.class);
    }

    public Flux<ArchivedCard> findByParentCard(ArchivedCard parentCard) {
        return findByParentCard(template, parentCard);
    }

    @Override
    public Mono<Page<Card>> findWithUserAndFilter(Tuple2<CurrentUserWithPerimeters, CardsFilter> filter) {
        CardsFilter queryFilter = filter.getT2();
        log.debug("findWithUserAndFilter {}", queryFilter);

        Pageable pageableRequest = PaginationUtils.createPageable(
                queryFilter.page() != null ? queryFilter.page().intValue() : null,
                queryFilter.size() != null ? queryFilter.size().intValue() : null);
        String[] fields = { "uid",
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
                "entityRecipients" };
        Aggregation agg = newAggregation(this.getFilterOperations(filter, pageableRequest, fields));
        Aggregation countAgg = newAggregation(this.getFilterOperationsForCount(filter));

        if (pageableRequest.isPaged()) {
            if (Boolean.TRUE.equals(queryFilter.latestUpdateOnly())) {
                return template.aggregate(agg, ARCHIVED_CARDS_COLLECTION, LatestUpdateOnlyArchivedLightCard.class)
                        .map(LatestUpdateOnlyArchivedLightCard::latestUpdateOnly)
                        .collectList()
                        .zipWith(template.aggregate(countAgg, ARCHIVED_CARDS_COLLECTION, String.class)
                                .defaultIfEmpty("{\"count\":0}")
                                .single())
                        .map(tuple -> new PageImpl<>(tuple.getT1(), pageableRequest,
                                PaginationUtils.getCountFromJson(tuple.getT2())));

            } else
                return template.aggregate(agg, ARCHIVED_CARDS_COLLECTION, Card.class)
                        .collectList()
                        .zipWith(template.aggregate(countAgg, ARCHIVED_CARDS_COLLECTION, String.class)
                                .defaultIfEmpty("{\"count\":0}")
                                .single())
                        .map(tuple -> new PageImpl<>(tuple.getT1(), pageableRequest,
                                PaginationUtils.getCountFromJson(tuple.getT2())));
        } else {
            if (Boolean.TRUE.equals(queryFilter.latestUpdateOnly())) {
                return template.aggregate(agg, ARCHIVED_CARDS_COLLECTION, LatestUpdateOnlyArchivedLightCard.class)
                        .map(LatestUpdateOnlyArchivedLightCard::latestUpdateOnly)
                        .collectList()
                        .map(PageImpl::new);
            } else
                return template.aggregate(agg, ARCHIVED_CARDS_COLLECTION, Card.class)
                        .collectList()
                        .map(PageImpl::new);
        }
    }

    public Flux<ArchivedCard> findByParentCard(ReactiveMongoTemplate template, ArchivedCard parentCard) {

        Query query = new Query();
        if (parentCard.deletionDate() == null) {
            query.addCriteria(
                    new Criteria().andOperator(
                            where(PARENT_CARD_ID_FIELD).is(parentCard.process() + "." + parentCard.processInstanceId()),
                            where(DELETION_DATE_FIELD).isNull()));
        } else if (parentCard.deletionDate().toEpochMilli() == 0) {
            // use to exclude old card inserted in archives before adding the current
            // feature
            return Flux.empty();
        } else {
            query.addCriteria(
                    new Criteria().andOperator(
                            where(PARENT_CARD_ID_FIELD).is(parentCard.process() + "." + parentCard.processInstanceId()),
                            where(PUBLISH_DATE_FIELD).lt(parentCard.deletionDate()),
                            new Criteria().orOperator(
                                    where(DELETION_DATE_FIELD).isNull(), // when parent has KEEP_CHILD_CARD action
                                    where(DELETION_DATE_FIELD).gte(parentCard.deletionDate()))));
        }
        return template.find(query, ArchivedCard.class);
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
