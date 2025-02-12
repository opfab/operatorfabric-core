/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.repositories;


import org.opfab.cards.consultation.configuration.CustomScreenDataFields;
import org.opfab.cards.consultation.model.CardsFilter;
import org.opfab.cards.consultation.model.Card;
import org.opfab.cards.consultation.model.CardOperation;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.springframework.data.domain.Page;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

import java.time.Instant;


/*
* <p>Needed to avoid trouble at runtime when springframework try to create mongo request for findByIdWithUser method</p>
* */
public interface CardCustomRepository extends UserUtilitiesCommonToCardRepository<Card> {

        /**
     * Finds Card updated earlier than latestPublication and either :
     * 
     * starting between rangeStart and rangeEnd
     * ending between rangeStart and rangeEnd
     * starting before rangeStart and ending after rangeEnd
     * starting before rangeStart and never ending
     * 
     *  if rangeStart is null, find cards with endDate < rangeEnd 
     *  if rangeEnd is null, find cards with startDate > rangeStart 
     *  if rangeStart and rangeEnd null, return null 
     * 
     * Cards fetched are limited to the ones that have been published either to login or to groups or to entities
     */
    Flux<CardOperation> getCardOperations(Instant updatedFrom, Instant rangeStart, Instant rangeEnd,
    CurrentUserWithPerimeters currentUserWithPerimeters, CustomScreenDataFields customScreenDataFields);


    Mono<Page<Object>> findWithUserAndFilter(
            Tuple2<CurrentUserWithPerimeters, CardsFilter> params);
}
