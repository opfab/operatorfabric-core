/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.repositories;

import lombok.extern.slf4j.Slf4j;
import org.opfab.cards.consultation.model.ArchivedCard;
import org.opfab.cards.consultation.model.CardsFilter;
import org.opfab.springtools.configuration.mongo.PaginationUtils;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.PermissionEnum;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import com.mongodb.BasicDBObject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

import static org.springframework.data.mongodb.core.query.Criteria.where;

import java.util.ArrayList;
import java.util.List;
import org.bson.Document;

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
    private static final String DOCUMENTS = "documents";
    private static final String CARDS = "cards";
    private static final String NUMBER_OF_VERSIONS = "numberOfVersions";
            
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
                public Mono<Page<Document>> findWithUserAndFilter(Tuple2<CurrentUserWithPerimeters, CardsFilter> filter) {
                    CardsFilter queryFilter = filter.getT2();
                    log.debug("findWithUserAndFilter {}", queryFilter);
            
                    boolean latestUpdateOnly = queryFilter.latestUpdateOnly();
            
                    Pageable pageable = PaginationUtils.createPageable(
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
            
                    List<AggregationOperation> operations = new ArrayList<>();
            
                    operations.addAll(this.getFilterOperations(filter, null, fields));
                    if (latestUpdateOnly) {
                        operations.add(Aggregation.project(PROCESS_FIELD, PROCESS_INSTANCE_ID_FIELD, PUBLISH_DATE_FIELD));
                        operations.add(Aggregation.sort(Sort.by(Sort.Order.desc(PUBLISH_DATE_FIELD))));
            
                        operations.add(Aggregation.group(PROCESS_FIELD, PROCESS_INSTANCE_ID_FIELD)
                                .push(new BasicDBObject(PUBLISH_DATE_FIELD, "$publishDate")
                                        .append("id", "$_id"))
                                .as(DOCUMENTS)
                            .count().as(COUNT));
        
                    operations.add(Aggregation.project(COUNT, DOCUMENTS)
                            .and(DOCUMENTS).slice(1, 0).as(DOCUMENTS));
        
                    operations.add(Aggregation.sort(Sort.by(Sort.Order.desc("documents.publishDate"))));
                }
                FacetOperation cardsFacet = Aggregation.facet(getFacetOperations(pageable, latestUpdateOnly, fields))
                        .as(CARDS);
        
                operations.add(cardsFacet.and(Aggregation.count().as(COUNT)).as("totalCount"));
        
                operations.add(Aggregation.unwind("totalCount"));
        
                operations.add(Aggregation.project()
                        .and("pageNumber").as("pageNumber")
                        .and("totalCount.count").as("total")
                        .and(CARDS).as(CARDS));
        
                Aggregation aggregation = Aggregation.newAggregation(operations);
        
                return template.aggregate(aggregation, ARCHIVED_CARDS_COLLECTION, Document.class)
                        .collectList()
                        .flatMap(results -> {
                            if (results.isEmpty()) {
                                return Mono.just(Page.empty(pageable));
                            }
        
                            Document result = results.get(0);
                            long total = result.getInteger("total");
                            List<Document> documents = result.getList(CARDS, Document.class);
    
                        return Mono.just(new PageImpl<Document>(documents, pageable, total));
                    });
        }
    
        private AggregationOperation[] getFacetOperations(Pageable pageable, boolean latestUpdateOnly, String[] fields) {
            List<AggregationOperation> operations = new ArrayList<>();
            if (pageable.isPaged()) {
                operations.add(Aggregation.skip((long) pageable.getPageNumber() * pageable.getPageSize()));
                operations.add(Aggregation.limit(pageable.getPageSize()));
            }
            if(latestUpdateOnly) {
                operations.add(Aggregation.project()
                .and(COUNT).as(NUMBER_OF_VERSIONS)
            .and("documents.publishDate").as(PUBLISH_DATE_FIELD)
            .and("documents.id").as("_id"));
    
            operations.add(Aggregation.unwind("_id"));
            operations.add(Aggregation.lookup(ARCHIVED_CARDS_COLLECTION, "_id", "_id", "firstCardDetails"));
            operations.add(Aggregation.unwind("firstCardDetails"));
            operations.add(computeProjectionOperationForLatestUpdateOnly(fields));
        } else {
            operations.add(computeProjectionOperation(fields));
        }

        return operations.toArray(new AggregationOperation[operations.size()]);
    }

    private ProjectionOperation computeProjectionOperationForLatestUpdateOnly(String[] fields) {
        ProjectionOperation projections =  Aggregation.project()
        .andExclude("_id").and(NUMBER_OF_VERSIONS).as(NUMBER_OF_VERSIONS).and("firstCardDetails._id").as("id");
        for (String field : fields) {
            projections = projections.and("firstCardDetails." + field).as(field);
        }
        return projections;
    }

    private ProjectionOperation computeProjectionOperation(String[] fields) {
        ProjectionOperation projections =  Aggregation.project()
        .andExclude("_id").and("_id").as("id");
        for (String field : fields) {
            projections = projections.and(field).as(field);
        }
        return projections;
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
