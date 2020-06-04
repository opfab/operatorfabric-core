/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.lfenergy.operatorfabric.cards.consultation.repositories;

import org.lfenergy.operatorfabric.cards.consultation.model.CardConsultationData;
import org.lfenergy.operatorfabric.users.model.User;
import reactor.core.publisher.Mono;

import java.time.Instant;

/*
* <p>Needed to avoid trouble at runtime when springframework try to create mongo request for findByIdWithUser method</p>
* */
public interface CardCustomRepository extends UserUtilitiesCommonToCardRepository<CardConsultationData> {

    Mono<CardConsultationData> findNextCardWithUser(Instant pivotalInstant, User user);
    Mono<CardConsultationData> findPreviousCardWithUser(Instant pivotalInstant
                                                  , User user
    );
}
