/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.lfenergy.operatorfabric.cards.consultation.repositories;

import org.lfenergy.operatorfabric.cards.consultation.model.Card;
import org.lfenergy.operatorfabric.users.model.CurrentUserWithPerimeters;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;

public interface UserUtilitiesCommonToCardRepository<T extends Card> {

    default Mono<T> findByIdWithUser(ReactiveMongoTemplate template, String id, CurrentUserWithPerimeters currentUserWithPerimeters, Class<T> clazz) {
        Query query = new Query();
        List<Criteria> criteria = computeCriteriaToFindCardByIdWithUser(id, currentUserWithPerimeters);
        if (!criteria.isEmpty())
            query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[criteria.size()])));

        return template.findOne(query, clazz);
    }

    default Flux<T> findByParentCardId(ReactiveMongoTemplate template, String parentUid, Class<T> clazz) {
        Query query = new Query();
        query.addCriteria(Criteria.where("parentCardId").is(parentUid));
        return template.find(query, clazz);
    }

    default List<Criteria> computeCriteriaToFindCardByIdWithUser(String id, CurrentUserWithPerimeters currentUserWithPerimeters) {
        List<Criteria> criteria = new ArrayList<>();
        criteria.add(Criteria.where("_id").is(id));
        criteria.addAll(computeCriteriaList4User(currentUserWithPerimeters));
        return criteria;
    }

    /*
    Rules for receiving cards :
    1) If the card is sent to entity A and group B, then to receive it,
       the user must be part of A AND (be part of B OR have the right for the process/state of the card)
    2) If the card is sent to entity A only, then to receive it, the user must be part of A and have the right for the process/state of the card
    3) If the card is sent to group B only, then to receive it, the user must be part of B
    */
    default List<Criteria> computeCriteriaList4User(CurrentUserWithPerimeters currentUserWithPerimeters) {
        List<Criteria> criteriaList = new ArrayList<>();
        List<Criteria> criteria = new ArrayList<>();
        String login = currentUserWithPerimeters.getUserData().getLogin();
        List<String> groups = currentUserWithPerimeters.getUserData().getGroups();
        List<String> entities = currentUserWithPerimeters.getUserData().getEntities();
        List<String> processStateList = new ArrayList<>();
        if (currentUserWithPerimeters.getComputedPerimeters() != null)
            currentUserWithPerimeters.getComputedPerimeters().forEach(perimeter ->
                    processStateList.add(perimeter.getProcess() + "." + perimeter.getState()));

        if (login != null) {
            criteriaList.add(Criteria.where("userRecipients").in(login));
        }
        if (!(groups == null || groups.isEmpty())) {    //card sent to group only
            criteriaList.add(Criteria.where("groupRecipients").in(groups).andOperator(new Criteria().orOperator(
                    Criteria.where("entityRecipients").exists(false), Criteria.where("entityRecipients").size(0))));
        }
        if (!(entities == null || entities.isEmpty())) {    //card sent to entity only
            criteriaList.add(Criteria.where("entityRecipients").in(entities)
                    .andOperator(new Criteria().orOperator(Criteria.where("groupRecipients").exists(false), Criteria.where("groupRecipients").size(0)),
                                 Criteria.where("processStateKey").in(processStateList)));
        }
        if (!(groups == null || groups.isEmpty()) &&  !(entities == null || entities.isEmpty()))    //card sent to group and entity
            criteriaList.add(Criteria.where("entityRecipients").in(entities).and("groupRecipients").in(groups));

        if (!(entities == null || entities.isEmpty()) &&  !(processStateList.isEmpty()))    //card sent to group and entity
            criteriaList.add(Criteria.where("entityRecipients").in(entities).and("processStateKey").in(processStateList));

        if (! criteriaList.isEmpty())
            criteria.add(new Criteria().orOperator(criteriaList.toArray(new Criteria[criteriaList.size()])));
        return criteria;
    }

    default Criteria computeUserCriteria(CurrentUserWithPerimeters currentUserWithPerimeters) {
        Criteria criteria = new Criteria();
        return (!computeCriteriaList4User(currentUserWithPerimeters).isEmpty()) ? computeCriteriaList4User(currentUserWithPerimeters).get(0) : criteria;
    }

    Mono<T> findByIdWithUser(String id, CurrentUserWithPerimeters user);
    Flux<T> findByParentCardId(String parentCardUid);
}
