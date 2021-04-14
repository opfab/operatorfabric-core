/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.consultation.repositories;

import org.lfenergy.operatorfabric.cards.consultation.model.Card;
import org.lfenergy.operatorfabric.users.model.CurrentUserWithPerimeters;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.data.mongodb.core.query.Criteria.where;

public interface UserUtilitiesCommonToCardRepository<T extends Card> {


    public static final String ENTITY_RECIPIENTS = "entityRecipients";
	public static final String GROUP_RECIPIENTS = "groupRecipients";
    public static final String PROCESS_STATE_KEY = "processStateKey";
    public static final String USER_RECIPIENTS = "userRecipients";
	public static final String PUBLISH_DATE_FIELD = "publishDate";
	public static final String START_DATE_FIELD = "startDate";
	public static final String END_DATE_FIELD = "endDate";

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
        criteria.add(computeCriteriaForUser(currentUserWithPerimeters));
        return criteria;
    }

    default Criteria computeCriteriaForUser(CurrentUserWithPerimeters currentUserWithPerimeters) {
        String login = currentUserWithPerimeters.getUserData().getLogin();
        List<String> groups = currentUserWithPerimeters.getUserData().getGroups();
        List<String> entities = currentUserWithPerimeters.getUserData().getEntities();
        List<String> processStateList = new ArrayList<>();
        if (currentUserWithPerimeters.getComputedPerimeters() != null)
            currentUserWithPerimeters.getComputedPerimeters().forEach(perimeter ->
                    processStateList.add(perimeter.getProcess() + "." + perimeter.getState()));

        return computeCriteriaForUser(login,groups,entities,processStateList);
    }

      /*
    Rules for receiving cards :
    1) If the card is sent to entity A and group B, then to receive it,
       the user must be part of A AND (be part of B OR have the right for the process/state of the card)
    2) If the card is sent to entity A only, then to receive it, the user must be part of A and have the right for the process/state of the card
    3) If the card is sent to group B only, then to receive it, the user must be part of B
    */
    default Criteria computeCriteriaForUser(String login, List<String> groups, List<String> entities, List<String> processStateList) {
        List<String> groupsList = (groups != null ? groups : new ArrayList<>());
        List<String> entitiesList = (entities != null ? entities : new ArrayList<>());

      return  new Criteria().orOperator(
                where(USER_RECIPIENTS).in(login),
                where(GROUP_RECIPIENTS).in(groupsList).andOperator(new Criteria().orOperator(   //card sent to group only
                        Criteria.where(ENTITY_RECIPIENTS).exists(false), Criteria.where(ENTITY_RECIPIENTS).size(0))),
                where(ENTITY_RECIPIENTS).in(entitiesList).andOperator(new Criteria().orOperator(    //card sent to entity only
                        Criteria.where(GROUP_RECIPIENTS).exists(false), Criteria.where(GROUP_RECIPIENTS).size(0)),
                        Criteria.where(PROCESS_STATE_KEY).in(processStateList)),
                where(ENTITY_RECIPIENTS).in(entitiesList).and(GROUP_RECIPIENTS).in(groupsList),    //card sent to group and entity
                where(ENTITY_RECIPIENTS).in(entitiesList).and(PROCESS_STATE_KEY).in(processStateList));  //card sent to group and entity 
                
    }



    Mono<T> findByIdWithUser(String id, CurrentUserWithPerimeters user);
    Flux<T> findByParentCardId(String parentCardId);
    Flux<T> findByInitialParentCardUid(String initialParentCardUid);
}
