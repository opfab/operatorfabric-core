/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.repositories;

import org.lfenergy.operatorfabric.cards.consultation.model.Card;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.data.mongodb.core.query.Criteria.where;

public interface UserUtilitiesCommonToCardRepository<T extends Card> {

    default Mono<T> findByIdWithUser(ReactiveMongoTemplate template, String id, User user, Class<T> clazz) {
        Query query = new Query();
        List<Criteria> criteria = computeCriteriaToFindCardByProcessIdWithUser(id, user);
        if (!criteria.isEmpty())
            query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[criteria.size()])));

        return template.findOne(query, clazz);
    }

    default List<Criteria> computeCriteriaToFindCardByProcessIdWithUser(String processId, User user) {
        List<Criteria> criteria = new ArrayList<>();
        criteria.add(Criteria.where("_id").is(processId));
        criteria.addAll(computeCriteriaList4User(user));
        return criteria;
    }

    default List<Criteria> computeCriteriaList4User(User user) {
        List<Criteria> criteriaList = new ArrayList<>();
        List<Criteria> criteria = new ArrayList<>();
        String login = user.getLogin();
        List<String> groups = user.getGroups();
        List<String> entities = user.getEntities();

        if (login != null) {
            criteriaList.add(new Criteria().where("userRecipients").in(login));
        }
        if (!(groups == null || groups.isEmpty())) {
            criteriaList.add(new Criteria().where("groupRecipients").in(groups).andOperator(new Criteria().orOperator(
                    Criteria.where("entityRecipients").exists(false), Criteria.where("entityRecipients").size(0))));
        }
        if (!(entities == null || entities.isEmpty())) {
            criteriaList.add(new Criteria().where("entityRecipients").in(entities).andOperator(new Criteria().orOperator(
                    Criteria.where("groupRecipients").exists(false), Criteria.where("groupRecipients").size(0))));
        }
        if (!(groups == null || groups.isEmpty()) &&  !(entities == null || entities.isEmpty()))
            criteriaList.add(new Criteria().where("groupRecipients").in(groups).and("entityRecipients").in(entities));

        if (! criteriaList.isEmpty())
            criteria.add(new Criteria().orOperator(criteriaList.toArray(new Criteria[criteriaList.size()])));
        return criteria;
    }

    default Criteria computeUserCriteria(User user) {
        Criteria criteria = new Criteria();
        return (!computeCriteriaList4User(user).isEmpty()) ? computeCriteriaList4User(user).get(0) : criteria;
    }

    Mono<T> findByIdWithUser(String id, User user);
}
