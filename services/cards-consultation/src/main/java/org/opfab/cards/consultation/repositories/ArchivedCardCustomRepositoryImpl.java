/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
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
import org.opfab.cards.consultation.model.ArchivedCardsFilter;
import org.opfab.cards.consultation.model.FilterModel;
import org.opfab.cards.consultation.model.LightCard;
import org.opfab.cards.consultation.model.LightCardConsultationData;
import org.opfab.springtools.configuration.mongo.PaginationUtils;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

import java.time.Instant;
import java.util.*;
import java.util.regex.Pattern;

import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
import net.minidev.json.parser.ParseException;

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

    private static final List<String> SPECIAL_PARAMETERS = Arrays.asList(
            PUBLISH_DATE_FROM_PARAM, PUBLISH_DATE_TO_PARAM, ACTIVE_FROM_PARAM, ACTIVE_TO_PARAM,
            PAGE_PARAM, PAGE_SIZE_PARAM, CHILD_CARDS_PARAM, LATEST_UPDATE_ONLY, ADMIN_MODE);


    private static final String ARCHIVED_CARDS_COLLECTION = "archivedCards";

    private final ReactiveMongoTemplate template;

    @Autowired
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
    public Mono<Page<LightCard>> findWithUserAndFilter(Tuple2<CurrentUserWithPerimeters, ArchivedCardsFilter> filter) {
        ArchivedCardsFilter queryFilter = filter.getT2();
        log.info("findWithUserAndFilter" + queryFilter);

        Pageable pageableRequest = PaginationUtils.createPageable(queryFilter.getPage() != null ? queryFilter.getPage().intValue() : null , queryFilter.getSize() != null ? queryFilter.getSize().intValue() : null);

        Aggregation agg = newAggregation( this.getFilterOperations(filter,pageableRequest));
        Aggregation countAgg = newAggregation( this.getFilterOperationsForCount(filter));

        if (pageableRequest.isPaged()) {
            return template.aggregate(agg, ARCHIVED_CARDS_COLLECTION, LightCardConsultationData.class)
                    .cast(LightCard.class).collectList()
                    .zipWith(template.aggregate(countAgg, ARCHIVED_CARDS_COLLECTION, String.class)
                            .defaultIfEmpty("{\"count\":0}")
                            .single())
                    .map(tuple -> new PageImpl<>(tuple.getT1(), pageableRequest, this.getCountFromJson(tuple.getT2())));
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

    public Mono<Page<LightCard>> findWithUserAndParams(Tuple2<CurrentUserWithPerimeters, MultiValueMap<String, String>> params) {
        //Handle Paging
        Pageable pageableRequest = createPageableFromParams(params.getT2());

        Aggregation agg = newAggregation( this.getOperations(params,pageableRequest));
        Aggregation countAgg = newAggregation( this.getOperationsForCount(params));

        if (pageableRequest.isPaged()) {
            return template.aggregate(agg, ARCHIVED_CARDS_COLLECTION, LightCardConsultationData.class)
                    .cast(LightCard.class).collectList()
                    .zipWith(template.aggregate(countAgg, ARCHIVED_CARDS_COLLECTION, String.class)
                        .defaultIfEmpty("{\"count\":0}")
                        .single())
                    .map(tuple -> new PageImpl<>(tuple.getT1(), pageableRequest, this.getCountFromJson(tuple.getT2())));
        } else {
            return template.aggregate(agg, ARCHIVED_CARDS_COLLECTION, LightCardConsultationData.class)
                    .cast(LightCard.class).collectList()
                    .map(PageImpl::new);
        }
        //The class used as a parameter for the find & count methods is LightCard (and not LightCardConsultationData) to make use of the existing LightCardReadConverter
    }

    private long getCountFromJson(String json ) {
        JSONObject count;
        try {
            count = (JSONObject) (new JSONParser(JSONParser.MODE_PERMISSIVE)).parse(json);
        } catch (ParseException e) {
            log.error("Error", e);
            return 0;
        }
        return ((Integer) count.get(COUNT)).longValue();
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


    private  List<AggregationOperation> getOperations(Tuple2<CurrentUserWithPerimeters,
        MultiValueMap<String, String>> params,Pageable pageableRequest) {

        CurrentUserWithPerimeters currentUserWithPerimeters = params.getT1();
        MultiValueMap<String, String> queryParams = params.getT2();

        boolean isAdminMode = checkIfInAdminMode(currentUserWithPerimeters, params.getT2());

        List<Criteria> criteria = getCriteria(queryParams, currentUserWithPerimeters, isAdminMode);

        boolean latestUpdateOnly = isLatestUpdateOnlyParamPresent(params.getT2());

        List<AggregationOperation> operations = new ArrayList<>(Arrays.asList(
                match(new Criteria().andOperator(criteria.toArray(new Criteria[criteria.size()]))),

            // We select only wanted values
            // especially because we need to exclude the "data" field which can be big
            // and cause OutOfMemory problems or exceed mongoDB limits
            // with the  group operation (see code lines after)
                project("uid",
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
                        "representativeType"),

                sort(Sort.by(Sort.Order.desc(PUBLISH_DATE_FIELD)))));

        if (latestUpdateOnly) {
            operations.add(group(PROCESS_FIELD,PROCESS_INSTANCE_ID_FIELD).first(Aggregation.ROOT).as(LATEST_UPDATE_ONLY));
            operations.add(project(LATEST_UPDATE_ONLY).andExclude("_id"));
            operations.add(sort(Sort.by(Sort.Order.desc(LATEST_UPDATE_ONLY + "." + PUBLISH_DATE_FIELD))));

        }
        if ((pageableRequest != null) && (pageableRequest.isPaged())) {
            operations.add(skip((long) (pageableRequest.getPageNumber() * pageableRequest.getPageSize())));
            operations.add(limit(pageableRequest.getPageSize()));
        }
        return operations;
    }

    private  List<AggregationOperation> getOperationsForCount(Tuple2<CurrentUserWithPerimeters,
    MultiValueMap<String, String>> params) {

        CurrentUserWithPerimeters currentUserWithPerimeters = params.getT1();
        MultiValueMap<String, String> queryParams = params.getT2();

        boolean isAdminMode = checkIfInAdminMode(currentUserWithPerimeters, params.getT2());

        List<Criteria> criteria = getCriteria(queryParams, currentUserWithPerimeters, isAdminMode);

        boolean latestUpdateOnly = isLatestUpdateOnlyParamPresent(params.getT2());

        List<AggregationOperation> operations = new ArrayList<>(Arrays.asList(
                match(new Criteria().andOperator(criteria.toArray(new Criteria[criteria.size()]))),
                project("uid",
                        PROCESS_FIELD,
                        PROCESS_INSTANCE_ID_FIELD
                        )

                ));
        if (latestUpdateOnly) {
            operations.add(group(PROCESS_FIELD,PROCESS_INSTANCE_ID_FIELD).first(Aggregation.ROOT).as(LATEST_UPDATE_ONLY));
            operations.add(project(LATEST_UPDATE_ONLY).andExclude("_id"));
        }
        operations.add(count().as(COUNT));
        return operations;
    }

    private  List<AggregationOperation> getFilterOperations(Tuple2<CurrentUserWithPerimeters,
            ArchivedCardsFilter> params, Pageable pageableRequest) {

        CurrentUserWithPerimeters currentUserWithPerimeters = params.getT1();
        ArchivedCardsFilter filter = params.getT2();

        boolean isAdminMode = checkIfInAdminMode(currentUserWithPerimeters, filter);

        List<Criteria> criteria = getCriteria(filter, currentUserWithPerimeters, isAdminMode);

        boolean latestUpdateOnly = filter.getLatestUpdateOnly();

        List<AggregationOperation> operations = new ArrayList<>(Arrays.asList(
                match(new Criteria().andOperator(criteria.toArray(new Criteria[criteria.size()]))),

                // We select only wanted values
                // especially because we need to exclude the "data" field which can be big
                // and cause OutOfMemory problems or exceed mongoDB limits
                // with the  group operation (see code lines after)
                project("uid",
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
                        "representativeType"),

                sort(Sort.by(Sort.Order.desc(PUBLISH_DATE_FIELD)))));

        if (latestUpdateOnly) {
            operations.add(group(PROCESS_FIELD,PROCESS_INSTANCE_ID_FIELD).first(Aggregation.ROOT).as(LATEST_UPDATE_ONLY));
            operations.add(project(LATEST_UPDATE_ONLY).andExclude("_id"));
            operations.add(sort(Sort.by(Sort.Order.desc(LATEST_UPDATE_ONLY + "." + PUBLISH_DATE_FIELD))));

        }
        if ((pageableRequest != null) && (pageableRequest.isPaged())) {
            operations.add(skip((long) (pageableRequest.getPageNumber() * pageableRequest.getPageSize())));
            operations.add(limit(pageableRequest.getPageSize()));
        }
        return operations;
    }

    private  List<AggregationOperation> getFilterOperationsForCount(Tuple2<CurrentUserWithPerimeters,
            ArchivedCardsFilter> params) {

        CurrentUserWithPerimeters currentUserWithPerimeters = params.getT1();
        ArchivedCardsFilter filter = params.getT2();

        boolean isAdminMode = checkIfInAdminMode(currentUserWithPerimeters, filter);

        List<Criteria> criteria = this.getCriteria(filter, currentUserWithPerimeters, isAdminMode);

        boolean latestUpdateOnly = filter.getLatestUpdateOnly();

        List<AggregationOperation> operations = new ArrayList<>(Arrays.asList(
                match(new Criteria().andOperator(criteria.toArray(new Criteria[criteria.size()]))),
                project("uid",
                        PROCESS_FIELD,
                        PROCESS_INSTANCE_ID_FIELD
                )

        ));
        if (latestUpdateOnly) {
            operations.add(group(PROCESS_FIELD,PROCESS_INSTANCE_ID_FIELD).first(Aggregation.ROOT).as(LATEST_UPDATE_ONLY));
            operations.add(project(LATEST_UPDATE_ONLY).andExclude("_id"));
        }
        operations.add(count().as(COUNT));
        return operations;
    }

    private List<Criteria> getCriteria(MultiValueMap<String, String> queryParams,
                                       CurrentUserWithPerimeters currentUserWithPerimeters,
                                       boolean isAdminMode) {
        List<Criteria> criteria = new ArrayList<>();
        // Publish date range
        criteria.addAll(publishDateCriteria(queryParams));

        // Active range
        criteria.addAll(activeRangeCriteria(queryParams));

        /* Handle regular parameters */
        criteria.addAll(regularParametersCriteria(queryParams));

        /* Add user criteria */
        if (! isAdminMode)
            criteria.add(computeCriteriaForUser(currentUserWithPerimeters));

        /* Add child cards criteria (by default, child cards are not included) */
        criteria.add(childCardsIncludedOrNotCriteria(queryParams));

        return criteria;

    }

    private List<Criteria> getCriteria(ArchivedCardsFilter filter,
    CurrentUserWithPerimeters currentUserWithPerimeters,
    boolean isAdminMode) {
        List<Criteria> criteria = new ArrayList<>();
        // Publish date range
        criteria.addAll(publishDateCriteria(filter));

        // Active range
        criteria.addAll(activeDateRangeCriteria(filter));

        /* Handle regular parameters */
        criteria.addAll(getFilterCriteria(filter));

        /* Add user criteria */
        if (! isAdminMode)
            criteria.add(computeCriteriaForUser(currentUserWithPerimeters));

        /* Add child cards criteria (by default, child cards are not included) */
        criteria.add(childCardsIncludedOrNotCriteria(filter));

        return criteria;

    }

    private List<Criteria> regularParametersCriteria(MultiValueMap<String, String> params) {

        List<Criteria> criteria = new ArrayList<>();

        params.forEach((key, values) -> {
            if (!SPECIAL_PARAMETERS.contains(key)) {
                criteria.add(Criteria.where(key).in(values));
            }
        });

        return criteria;
    }

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

    private List<Criteria> getFilterCriteria(ArchivedCardsFilter filter) {

        List<Criteria> criteria = new ArrayList<>();

        filter.getFilters().forEach(columnFilter -> {
            if (!SPECIAL_PARAMETERS.contains(columnFilter.getColumnName()) && columnFilter.getOperation() == null) {
                // Multiple conditions operations are not supported yet
                criteria.add(getMatchingCriteria(columnFilter));
            }
        });
        return criteria;
    }

    private Criteria getMatchingCriteria(FilterModel columnFilter) {
        Criteria criteria = null;
        switch(columnFilter.getMatchType()) {
            case EQUALS: 
                criteria =  Criteria.where(columnFilter.getColumnName()).regex(getEqualsIgnoreCasePattern(columnFilter.getFilter().get(0)));
                break;
            case NOTEQUAL:
                criteria =  Criteria.where(columnFilter.getColumnName()).regex(getNotEqualsIgnoreCasePattern(columnFilter.getFilter().get(0)));
                break;
            case BLANK: 
                criteria =  Criteria.where(columnFilter.getColumnName()).isNull();
                break;
            case NOTBLANK:
                criteria =  Criteria.where(columnFilter.getColumnName()).exists(true);
                break;
            case STARTSWITH:
                criteria =  Criteria.where(columnFilter.getColumnName()).regex(getStartsWithIgnoreCasePattern(columnFilter.getFilter().get(0)));
                break;
            case ENDSWITH:
                criteria =  Criteria.where(columnFilter.getColumnName()).regex(getEndsWithIgnoreCasePattern(columnFilter.getFilter().get(0)));
                break;
            case CONTAINS:
                criteria =  Criteria.where(columnFilter.getColumnName()).regex(getContainsIgnoreCasePattern(columnFilter.getFilter().get(0)));
                break;
            case NOTCONTAINS:
                criteria =  Criteria.where(columnFilter.getColumnName()).regex(getNotContainsIgnoreCasePattern(columnFilter.getFilter().get(0)));
                break;
            case IN:
                criteria =  Criteria.where(columnFilter.getColumnName()).in(columnFilter.getFilter());
                break;
        }
        return criteria;
    }

    private Pattern getEqualsIgnoreCasePattern(String value) {
        return Pattern.compile("^" + Pattern.quote(value) + "$", Pattern.CASE_INSENSITIVE);
    }

    private Pattern getNotEqualsIgnoreCasePattern(String value) {
        return Pattern.compile("^(?!" + Pattern.quote(value) + "$)", Pattern.CASE_INSENSITIVE);
    }

    private Pattern getStartsWithIgnoreCasePattern(String value) {
        return Pattern.compile("^" + Pattern.quote(value), Pattern.CASE_INSENSITIVE);
    }

    private Pattern getEndsWithIgnoreCasePattern(String value) {
        return Pattern.compile(Pattern.quote(value) + "$", Pattern.CASE_INSENSITIVE);
    }

    private Pattern getContainsIgnoreCasePattern(String value) {
        return Pattern.compile( Pattern.quote(value), Pattern.CASE_INSENSITIVE);
    }

    private Pattern getNotContainsIgnoreCasePattern(String value) {
        return Pattern.compile("^((?!" + Pattern.quote(value) + ").)*$", Pattern.CASE_INSENSITIVE);
    }

    private boolean isLatestUpdateOnlyParamPresent(MultiValueMap<String, String> params) {
        if (params.containsKey(LATEST_UPDATE_ONLY)) {
            String latestUpdateOnly = params.getFirst(LATEST_UPDATE_ONLY);
            return(latestUpdateOnly != null) && (latestUpdateOnly.equals("true"));
        }
        return false;
    }

    private boolean checkIfInAdminMode(CurrentUserWithPerimeters currentUserWithPerimeters,
                                            MultiValueMap<String, String> params) {
        if (params.containsKey(ADMIN_MODE)) {
            String adminMode = params.getFirst(ADMIN_MODE);
            boolean isCurrentUserMemberOfAdminGroup = ((currentUserWithPerimeters.getUserData().getGroups() != null) &&
                                                      (currentUserWithPerimeters.getUserData().getGroups().contains("ADMIN")));

            if ((adminMode != null) && (adminMode.equals("true")) && (!isCurrentUserMemberOfAdminGroup))
                log.warn("Parameter {} set to true in the request but the user is not member of ADMIN group", ADMIN_MODE);

            return isCurrentUserMemberOfAdminGroup && (adminMode != null) && (adminMode.equals("true"));
        }
        return false;
    }

    private boolean checkIfInAdminMode(CurrentUserWithPerimeters currentUserWithPerimeters,
                                       ArchivedCardsFilter filter) {
        if (filter.getAdminMode() != null) {
            boolean adminMode = Boolean.TRUE.equals(filter.getAdminMode());
            boolean isCurrentUserMemberOfAdminGroup = ((currentUserWithPerimeters.getUserData().getGroups() != null) &&
                    (currentUserWithPerimeters.getUserData().getGroups().contains("ADMIN")));

            if (adminMode && !isCurrentUserMemberOfAdminGroup)
                log.warn("Parameter {} set to true in the request but the user is not member of ADMIN group", ADMIN_MODE);

            return isCurrentUserMemberOfAdminGroup && adminMode;
        }
        return false;
    }

    private Criteria childCardsIncludedOrNotCriteria(MultiValueMap<String, String> params) {

        if (params.containsKey(CHILD_CARDS_PARAM)) {
            String childCardsParam = params.getFirst(CHILD_CARDS_PARAM);

            if ((childCardsParam != null) && (childCardsParam.equalsIgnoreCase("true")))
                return new Criteria();
        }
        return Criteria.where(PARENT_CARD_ID_FIELD).exists(false);
    }

    private Criteria childCardsIncludedOrNotCriteria(ArchivedCardsFilter filter) {

        if (Boolean.TRUE.equals(filter.getIncludeChildCards())) return new Criteria();

        return Criteria.where(PARENT_CARD_ID_FIELD).exists(false);
    }
    private List<Criteria> activeRangeCriteria(MultiValueMap<String, String> params) {

        List<Criteria> criteria = new ArrayList<>();

        if (params.containsKey(ACTIVE_FROM_PARAM) && params.containsKey(ACTIVE_TO_PARAM)) {
            Instant activeFrom = Instant.ofEpochMilli(Long.parseLong(params.getFirst(ACTIVE_FROM_PARAM)));
            Instant activeTo = Instant.ofEpochMilli(Long.parseLong(params.getFirst(ACTIVE_TO_PARAM)));
            criteria.add(new Criteria().orOperator(
                    //Case 1: Card start date is included in query filter range
                    where(START_DATE_FIELD).gte(activeFrom).lte(activeTo),
                    //Case 2: Card start date is before start of query filter range and end date after start of query filter
                    new Criteria().andOperator(
                        where(START_DATE_FIELD).lte(activeFrom),
                        where(END_DATE_FIELD).gte(activeFrom))
                    )
			);

        } else if (params.containsKey(ACTIVE_FROM_PARAM)) {
            Instant activeFrom = Instant.ofEpochMilli(Long.parseLong(params.getFirst(ACTIVE_FROM_PARAM)));
            criteria.add(new Criteria().orOperator(
                where(END_DATE_FIELD).gte(activeFrom),
                where(START_DATE_FIELD).gte(activeFrom)
            ));
        } else if (params.containsKey(ACTIVE_TO_PARAM)) {
            Instant activeTo = Instant.ofEpochMilli(Long.parseLong(params.getFirst(ACTIVE_TO_PARAM)));
            criteria.add(Criteria.where(START_DATE_FIELD).lte(activeTo));
        }

        return criteria;
    }

    private List<Criteria> publishDateCriteria(ArchivedCardsFilter filter) {

        List<Criteria> criteria = new ArrayList<>();

        Optional<FilterModel> publishDateFilterFrom = filter.getFilters().stream().filter(f -> f.getColumnName().equals(PUBLISH_DATE_FROM_PARAM)).findFirst();
        Optional<FilterModel> publishDateFilterTo = filter.getFilters().stream().filter(f -> f.getColumnName().equals(PUBLISH_DATE_TO_PARAM)).findFirst();

        if (publishDateFilterFrom.isPresent() && publishDateFilterTo.isPresent()) {
            criteria.add(Criteria.where(PUBLISH_DATE_FIELD)
                    .gte(Instant.ofEpochMilli(Long.parseLong(publishDateFilterFrom.get().getFilter().get(0))))
                    .lte(Instant.ofEpochMilli(Long.parseLong(publishDateFilterTo.get().getFilter().get(0)))));
        } else if (publishDateFilterFrom.isPresent()) {
            criteria.add(Criteria.where(PUBLISH_DATE_FIELD)
                    .gte(Instant.ofEpochMilli(Long.parseLong(publishDateFilterFrom.get().getFilter().get(0)))));
        } else if (publishDateFilterTo.isPresent()) {
            criteria.add(Criteria.where(PUBLISH_DATE_FIELD)
                    .lte(Instant.ofEpochMilli(Long.parseLong(publishDateFilterTo.get().getFilter().get(0)))));
        }
        return criteria;
    }


    private List<Criteria> activeDateRangeCriteria(ArchivedCardsFilter filter) {

        List<Criteria> criteria = new ArrayList<>();


        Optional<FilterModel> activeDateFilterFrom = filter.getFilters().stream().filter(f -> f.getColumnName().equals(ACTIVE_FROM_PARAM)).findFirst();
        Optional<FilterModel> activeDateFilterTo = filter.getFilters().stream().filter(f -> f.getColumnName().equals(ACTIVE_TO_PARAM)).findFirst();

        if (activeDateFilterFrom.isPresent() && activeDateFilterTo.isPresent()) {
            Instant activeFrom = Instant.ofEpochMilli(Long.parseLong(activeDateFilterFrom.get().getFilter().get(0)));
            Instant activeTo = Instant.ofEpochMilli(Long.parseLong(activeDateFilterTo.get().getFilter().get(0)));
            criteria.add(new Criteria().orOperator(
                    //Case 1: Card start date is included in query filter range
                    where(START_DATE_FIELD).gte(activeFrom).lte(activeTo),
                    //Case 2: Card start date is before start of query filter range and end date after start of query filter
                    new Criteria().andOperator(
                        where(START_DATE_FIELD).lte(activeFrom),
                        where(END_DATE_FIELD).gte(activeFrom))
                    )
			);

        } else if (activeDateFilterFrom.isPresent()) {
            Instant activeFrom = Instant.ofEpochMilli(Long.parseLong(activeDateFilterFrom.get().getFilter().get(0)));
            criteria.add(new Criteria().orOperator(
                where(END_DATE_FIELD).gte(activeFrom),
                where(START_DATE_FIELD).gte(activeFrom)
            ));
        } else if (activeDateFilterTo.isPresent()) {
            Instant activeTo = Instant.ofEpochMilli(Long.parseLong(activeDateFilterTo.get().getFilter().get(0)));
            criteria.add(Criteria.where(START_DATE_FIELD).lte(activeTo));
        }

        return criteria;
    }
}
