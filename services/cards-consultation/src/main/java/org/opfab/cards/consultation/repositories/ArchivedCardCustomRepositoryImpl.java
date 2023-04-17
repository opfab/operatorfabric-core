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
import org.opfab.cards.consultation.model.ArchivedCardConsultationData;
import org.opfab.cards.consultation.model.CardsFilter;
import org.opfab.cards.consultation.model.LightCard;
import org.opfab.cards.consultation.model.LightCardConsultationData;
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

import java.util.*;

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

    public Mono<ArchivedCardConsultationData> findByIdWithUser(String id, CurrentUserWithPerimeters currentUserWithPerimeters) {
        return findByIdWithUser(template, id, currentUserWithPerimeters, ArchivedCardConsultationData.class);
    }

    public Flux<ArchivedCardConsultationData> findByParentCardId(String parentId) {
        return findByParentCardId(template, parentId, ArchivedCardConsultationData.class);
    }

    public Flux<ArchivedCardConsultationData> findByInitialParentCardUid(String initialParentCardUid) {
        return findByInitialParentCardUid(template, initialParentCardUid, ArchivedCardConsultationData.class);
    }

    public Flux<ArchivedCardConsultationData> findByParentCard(ArchivedCardConsultationData parentCard) {
        return findByParentCard(template, parentCard);
    }

    @Override
    public Mono<Page<LightCard>> findWithUserAndFilter(Tuple2<CurrentUserWithPerimeters, CardsFilter> filter) {
        CardsFilter queryFilter = filter.getT2();
        log.debug("findWithUserAndFilter {}", queryFilter);

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
        "representativeType"};
        Aggregation agg = newAggregation( this.getFilterOperations(filter,pageableRequest, fields));
        Aggregation countAgg = newAggregation( this.getFilterOperationsForCount(filter));

        if (pageableRequest.isPaged()) {
            return template.aggregate(agg, ARCHIVED_CARDS_COLLECTION, LightCardConsultationData.class)
                    .cast(LightCard.class).collectList()
                    .zipWith(template.aggregate(countAgg, ARCHIVED_CARDS_COLLECTION, String.class)
                            .defaultIfEmpty("{\"count\":0}")
                            .single())
                    .map(tuple -> new PageImpl<>(tuple.getT1(), pageableRequest, PaginationUtils.getCountFromJson(tuple.getT2())));
        } else {
            return template.aggregate(agg, ARCHIVED_CARDS_COLLECTION, LightCardConsultationData.class)
                    .cast(LightCard.class).collectList()
                    .map(PageImpl::new);
        }
    }


    public Flux<ArchivedCardConsultationData> findByParentCard(ReactiveMongoTemplate template, ArchivedCardConsultationData parentCard) {

        Query query = new Query();
        if (parentCard.getDeletionDate() == null) {
            query.addCriteria(
                new Criteria().andOperator(
                    where(PARENT_CARD_ID_FIELD).is(parentCard.getProcess() + "." + parentCard.getProcessInstanceId()),
                    where(DELETION_DATE_FIELD).isNull()
                )
            );
        } else if (parentCard.getDeletionDate().toEpochMilli() == 0) {
            // use to exclude old card inserted in archives before adding the current feature 
            return Flux.empty();
        } else {
            query.addCriteria(
                new Criteria().andOperator(
                    where(PARENT_CARD_ID_FIELD).is(parentCard.getProcess() + "." + parentCard.getProcessInstanceId()),
                    where(PUBLISH_DATE_FIELD).lt(parentCard.getDeletionDate()),
                    new Criteria().orOperator(
                        where(DELETION_DATE_FIELD).isNull(), // when parent has keepChildCard=true
                        where(DELETION_DATE_FIELD).gte(parentCard.getDeletionDate())
                    )
                )
            );
        }
        return template.find(query,  ArchivedCardConsultationData.class);
    }

    public boolean checkIfInAdminMode(CurrentUserWithPerimeters currentUserWithPerimeters,
            CardsFilter filter) {
        if (filter.getAdminMode() != null) {
            boolean adminMode = Boolean.TRUE.equals(filter.getAdminMode());
            boolean isCurrentUserMemberOfAdminGroup = ((currentUserWithPerimeters.getUserData().getGroups() != null) &&
                    (currentUserWithPerimeters.getUserData().getGroups().contains("ADMIN")));

            boolean hasCurrentUserAdminPermission = hasCurrentUserAnyPermission(currentUserWithPerimeters,
                    PermissionEnum.ADMIN, PermissionEnum.VIEW_ALL_ARCHIVED_CARDS);

            if (adminMode && !isCurrentUserMemberOfAdminGroup &&
                    !hasCurrentUserAdminPermission)
                log.warn("Parameter {} set to true in the request but the user is not member of ADMIN group",
                        ADMIN_MODE);

            return (isCurrentUserMemberOfAdminGroup || hasCurrentUserAdminPermission) && adminMode;
        }
        return false;
    }

}
