/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.repositories;


import net.minidev.json.JSONObject;
import org.opfab.cards.consultation.model.CardsFilter;
import org.opfab.cards.consultation.model.CardConsultationData;
import org.opfab.cards.consultation.model.CardOperation;
import org.opfab.cards.consultation.model.LightCard;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.springframework.data.domain.Page;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

import java.time.Instant;


/*
* <p>Needed to avoid trouble at runtime when springframework try to create mongo request for findByIdWithUser method</p>
* */
public interface CardCustomRepository extends UserUtilitiesCommonToCardRepository<CardConsultationData> {

        /**
     * Finds Card published earlier than <code>latestPublication</code> and either :
     * <ul>
     * <li>starting between <code>rangeStart</code>and <code>rangeEnd</code></li>
     * <li>ending between <code>rangeStart</code>and <code>rangeEnd</code></li>
     * <li>starting before <code>rangeStart</code> and ending after <code>rangeEnd</code></li>
     * <li>starting before <code>rangeStart</code> and never ending</li>
     * </ul>
     * <br/>
     * <ul>
     * <li> if rangeStart is null , find cards with endDate < rangeEnd </li>
     * <li> if rangeEnd is null , find cards with startDate > rangeStart </li>
     * <li> if rangeStart and rangeEnd null , return null </li>
     * </ul>
     * Cards fetched are limited to the ones that have been published either to <code>login</code> or to <code>groups</code> or to <code>entities</code>
 
     */
    Flux<CardOperation> getCardOperations(Instant publishFrom, Instant rangeStart, Instant rangeEnd,
    CurrentUserWithPerimeters currentUserWithPerimeters);


    Mono<Page<Object>> findWithUserAndFilter(
            Tuple2<CurrentUserWithPerimeters, CardsFilter> params);
}
