/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.consultation.repositories;

import org.opfab.cards.consultation.model.Card;
import org.opfab.cards.consultation.model.FilterModel;
import org.opfab.springtools.configuration.mongo.PaginationUtils;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.PermissionEnum;
import org.opfab.users.model.RightsEnum;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

import org.opfab.cards.consultation.model.CardsFilter;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;

import org.springframework.data.mongodb.core.aggregation.*;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

import reactor.util.function.Tuple2;


import static org.springframework.data.mongodb.core.query.Criteria.where;

public interface UserUtilitiesCommonToCardRepository<T extends Card> {


    public static final String ENTITY_RECIPIENTS = "entityRecipients";
	public static final String GROUP_RECIPIENTS = "groupRecipients";
    public static final String PROCESS_STATE_KEY = "processStateKey";
    public static final String USER_RECIPIENTS = "userRecipients";
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

    public static final List<String> SPECIAL_PARAMETERS = Collections.unmodifiableList(Arrays.asList(
        PUBLISH_DATE_FROM_PARAM, PUBLISH_DATE_TO_PARAM, ACTIVE_FROM_PARAM, ACTIVE_TO_PARAM,
        PAGE_PARAM, PAGE_SIZE_PARAM, CHILD_CARDS_PARAM, LATEST_UPDATE_ONLY, ADMIN_MODE));

    default Mono<T> findByIdWithUser(ReactiveMongoTemplate template, String id, CurrentUserWithPerimeters currentUserWithPerimeters, Class<T> clazz) {
        Query query = new Query();
        List<Criteria> criteria = computeCriteriaToFindCardByIdWithUser(id, currentUserWithPerimeters);
        if (!criteria.isEmpty())
            query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[criteria.size()])));
        return template.findOne(query, clazz);
    }

    default Flux<T> findByParentCardId(ReactiveMongoTemplate template, String parentId, Class<T> clazz) {
        Query query = new Query();
        query.addCriteria(Criteria.where("parentCardId").is(parentId));
        return template.find(query, clazz);
    }

    default Flux<T> findByInitialParentCardUid(ReactiveMongoTemplate template, String initialParentCardUid, Class<T> clazz) {
        Query query = new Query();
        query.addCriteria(Criteria.where("initialParentCardUid").is(initialParentCardUid));
        return template.find(query, clazz);
    }

    default List<Criteria> computeCriteriaToFindCardByIdWithUser(String id, CurrentUserWithPerimeters currentUserWithPerimeters) {
        List<Criteria> criteria = new ArrayList<>();
        criteria.add(Criteria.where("_id").is(id));

        boolean isCurrentUserMemberOfAdminGroup = ((currentUserWithPerimeters.getUserData().getGroups() != null) &&
                                                   (currentUserWithPerimeters.getUserData().getGroups().contains("ADMIN")));
        
        boolean hasCurrentUserAdminPermission = hasCurrentUserAnyPermission(currentUserWithPerimeters, PermissionEnum.ADMIN, PermissionEnum.VIEW_ALL_ARCHIVED_CARDS);

        if (! isCurrentUserMemberOfAdminGroup && !hasCurrentUserAdminPermission)
            criteria.add(computeCriteriaForUser(currentUserWithPerimeters));
        return criteria;
    }

    default boolean hasCurrentUserAnyPermission(CurrentUserWithPerimeters user, PermissionEnum... permissions) {
        if (permissions == null || user.getPermissions() == null) return false;
        List<PermissionEnum> permissionsList = Arrays.asList(permissions);
        return user.getPermissions().stream().filter(role -> permissionsList.indexOf(role) >= 0).count() > 0;
    }

    default Criteria computeCriteriaForUser(CurrentUserWithPerimeters currentUserWithPerimeters) {
        String login = currentUserWithPerimeters.getUserData().getLogin();
        List<String> groups = currentUserWithPerimeters.getUserData().getGroups();
        List<String> entities = currentUserWithPerimeters.getUserData().getEntities();
        List<String> processStateList = new ArrayList<>();
        if (currentUserWithPerimeters.getComputedPerimeters() != null)
            currentUserWithPerimeters.getComputedPerimeters().forEach(perimeter -> {
                if ((perimeter.getRights() == RightsEnum.RECEIVE) || (perimeter.getRights() == RightsEnum.RECEIVEANDWRITE))
                    processStateList.add(perimeter.getProcess() + "." + perimeter.getState());
            });

        return computeCriteriaForUser(login,groups,entities,processStateList);
    }

    /** Rules for receiving cards :

    1) If the card is sent to user1, the card is received and visible for user1 if he has the receive right for the
       corresponding process/state (Receive or ReceiveAndWrite)
    2) If the card is sent to GROUP1 (or ENTITY1), the card is received and visible for user if all the following is true :
         - he's a member of GROUP1 (or ENTITY1)
         - he has the receive right for the corresponding process/state (Receive or ReceiveAndWrite)
    3) If the card is sent to ENTITY1 and GROUP1, the card is received and visible for user if all the following is true :
         - he's a member of ENTITY1 (either directly or through one of its children entities)
         - he's a member of GROUP1
         - he has the receive right for the corresponding process/state (Receive or ReceiveAndWrite)
    **/
    default Criteria computeCriteriaForUser(String login, List<String> groups, List<String> entities, List<String> processStateList) {
        List<String> groupsList = (groups != null ? groups : new ArrayList<>());
        List<String> entitiesList = (entities != null ? entities : new ArrayList<>());

        return  new Criteria().andOperator(where(PROCESS_STATE_KEY).in(processStateList),
                new Criteria().orOperator(where(USER_RECIPIENTS).in(login),
                        where(GROUP_RECIPIENTS).in(groupsList).andOperator
                                (new Criteria().orOperator
                                        (where(ENTITY_RECIPIENTS).exists(false), where(ENTITY_RECIPIENTS).size(0))),
                        where(ENTITY_RECIPIENTS).in(entitiesList).andOperator
                                (new Criteria().orOperator
                                        (where(GROUP_RECIPIENTS).exists(false), where(GROUP_RECIPIENTS).size(0))),
                        where(GROUP_RECIPIENTS).in(groupsList).and(ENTITY_RECIPIENTS).in(entitiesList)));
    }


    Mono<T> findByIdWithUser(String id, CurrentUserWithPerimeters user);
    Flux<T> findByParentCardId(String parentCardId);
    Flux<T> findByInitialParentCardUid(String initialParentCardUid);

    boolean checkIfInAdminMode(CurrentUserWithPerimeters currentUserWithPerimeters, CardsFilter filter);

    default List<AggregationOperation> getFilterOperations(
            Tuple2<CurrentUserWithPerimeters, CardsFilter> params, Pageable pageableRequest, String... fields) {

        CurrentUserWithPerimeters currentUserWithPerimeters = params.getT1();
        CardsFilter filter = params.getT2();

        boolean isAdminMode = checkIfInAdminMode(currentUserWithPerimeters, filter);

        List<Criteria> criteria = getCriteria(filter, currentUserWithPerimeters, isAdminMode);

        boolean latestUpdateOnly = filter.getLatestUpdateOnly();

        List<AggregationOperation> operations = new ArrayList<>(Arrays.asList(
                match(new Criteria().andOperator(criteria.toArray(new Criteria[criteria.size()]))),

                // We select only wanted values
                // especially because we need to exclude the "data" field which can be big
                // and cause OutOfMemory problems or exceed mongoDB limits
                // with the group operation (see code lines after)
                project(fields),
                sort(Sort.by(Sort.Order.desc(PUBLISH_DATE_FIELD)))));

        if (latestUpdateOnly) {
            operations.add(
                    group(PROCESS_FIELD, PROCESS_INSTANCE_ID_FIELD).first(Aggregation.ROOT).as(LATEST_UPDATE_ONLY));
            operations.add(project(LATEST_UPDATE_ONLY).andExclude("_id"));
            operations.add(sort(Sort.by(Sort.Order.desc(LATEST_UPDATE_ONLY + "." + PUBLISH_DATE_FIELD))));

        }
        if ((pageableRequest != null) && (pageableRequest.isPaged())) {
            operations.add(skip(((long) pageableRequest.getPageNumber()) * pageableRequest.getPageSize()));
            operations.add(limit(pageableRequest.getPageSize()));
        }
        return operations;
    }

    default List<AggregationOperation> getFilterOperationsForCount(
            Tuple2<CurrentUserWithPerimeters, CardsFilter> params) {

        CurrentUserWithPerimeters currentUserWithPerimeters = params.getT1();
        CardsFilter filter = params.getT2();

        boolean isAdminMode = checkIfInAdminMode(currentUserWithPerimeters, filter);

        List<Criteria> criteria = this.getCriteria(filter, currentUserWithPerimeters, isAdminMode);

        boolean latestUpdateOnly = filter.getLatestUpdateOnly();

        List<AggregationOperation> operations = new ArrayList<>(Arrays.asList(
                match(new Criteria().andOperator(criteria.toArray(new Criteria[criteria.size()]))),
                project("uid",
                        PROCESS_FIELD,
                        PROCESS_INSTANCE_ID_FIELD)

        ));
        if (latestUpdateOnly) {
            operations.add(
                    group(PROCESS_FIELD, PROCESS_INSTANCE_ID_FIELD).first(Aggregation.ROOT).as(LATEST_UPDATE_ONLY));
            operations.add(project(LATEST_UPDATE_ONLY).andExclude("_id"));
        }
        operations.add(count().as(PaginationUtils.COUNT));
        return operations;
    }

    private List<Criteria> getCriteria(CardsFilter filter,
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
        if (!isAdminMode)
            criteria.add(computeCriteriaForUser(currentUserWithPerimeters));

        /* Add child cards criteria (by default, child cards are not included) */
        criteria.add(childCardsIncludedOrNotCriteria(filter));

        return criteria;

    }

    private List<Criteria> getFilterCriteria(CardsFilter filter) {

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

    private Criteria childCardsIncludedOrNotCriteria(CardsFilter filter) {

        if (Boolean.TRUE.equals(filter.getIncludeChildCards())) return new Criteria();

        return Criteria.where(PARENT_CARD_ID_FIELD).exists(false);
    }

    private List<Criteria> publishDateCriteria(CardsFilter filter) {

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


    private List<Criteria> activeDateRangeCriteria(CardsFilter filter) {

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
