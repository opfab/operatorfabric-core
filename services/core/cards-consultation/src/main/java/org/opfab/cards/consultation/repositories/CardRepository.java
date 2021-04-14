/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.consultation.repositories;

import org.opfab.cards.consultation.model.CardConsultationData;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;


/**
 * <p>Custom spring mongo reactive repository to access {@link org.lfenergy.operatorfabric.cards.consultation.model.Card} mongodb collection</p>
 *
 *
 */
@Repository
public interface CardRepository extends ReactiveMongoRepository<CardConsultationData, String>,CardCustomRepository {

}
