/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.repositories;

import org.lfenergy.operatorfabric.cards.consultation.model.ArchivedCardConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.model.CardConsultationData;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * <p>Custom spring mongo reactive repository to access the archived {@link org.lfenergy.operatorfabric.cards.consultation.model.Card} mongodb collection</p>
 *
 * @author Alexandra Guironnet
 */
@Repository
public interface ArchivedCardRepository extends ReactiveMongoRepository<ArchivedCardConsultationData, String> {

    /**
     * Finds card by processID (i.e. process current state)
     *
     * @param processId for which we want to find card
     * @return card with given processId
     */
    public Mono<ArchivedCardConsultationData> findByProcessId(String processId);

    public Flux<ArchivedCardConsultationData> findAll();

}
