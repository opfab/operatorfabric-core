/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.repositories;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.consultation.model.CardConsultationData;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Slf4j
public class CardCustomRepositoryImpl implements CardCustomRepository {

    private final ReactiveMongoTemplate template;
    private static final String START_DATE = "startDate"; 

    @Autowired
    public CardCustomRepositoryImpl(ReactiveMongoTemplate template) {
        this.template = template;
    }

    public Mono<CardConsultationData> findByIdWithUser(String processId, User user) {
        return findByIdWithUser(template, processId, user, CardConsultationData.class);
    }

    /**
     * Looks for the next card if any, whose startDate is before a specified date.
     * The cards are filtered such as the requesting user is among theirs recipients.
     *
     * @param pivotalInstant specified reference date
     * @param user           requesting user
     * @return Card result or empty Mono
     */
    public Mono<CardConsultationData> findNextCardWithUser(Instant pivotalInstant, User user) {
        Query query = new Query();
        Criteria criteria = Criteria.where(START_DATE)

                .gte(pivotalInstant);// search in the future

        query.addCriteria(criteria.andOperator(this.computeUserCriteria(user)));
        query.with(Sort.by(new Sort.Order(

                Sort.Direction.ASC// sort for the nearer cards in the future first

                , START_DATE)));
        query.with(Sort.by(new Sort.Order(Sort.Direction.ASC, "_id")));
        return template.findOne(query, CardConsultationData.class);
    }

    /**
     * Look for the next card if any whose startDate is after a specified date
     * The cards are filtered such as the requesting user is among theirs recipients.
     *
     * @param pivotalInstant specified reference date
     * @param user           requesting user
     * @return Card result or empty Mono
     */
    public Mono<CardConsultationData> findPreviousCardWithUser(Instant pivotalInstant, User user) {
        Query query = new Query();
        Criteria criteria = Criteria.where(START_DATE)

                .lte(pivotalInstant);// search in the past

        query.addCriteria(criteria.andOperator(this.computeUserCriteria(user)));
        query.with(Sort.by(new Sort.Order(

                Sort.Direction.DESC// sort for the most recent cards first

                , START_DATE)));
        query.with(Sort.by(new Sort.Order(Sort.Direction.ASC, "_id")));
        return template.findOne(query, CardConsultationData.class);
    }
}
