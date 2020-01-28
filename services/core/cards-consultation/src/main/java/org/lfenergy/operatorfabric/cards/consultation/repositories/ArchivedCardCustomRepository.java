/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.repositories;

import org.lfenergy.operatorfabric.cards.consultation.model.ArchivedCardConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.model.LightCardConsultationData;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.data.domain.Page;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

public interface ArchivedCardCustomRepository extends UserUtilitiesCommonToCardRepository<ArchivedCardConsultationData> {

    Mono<Page<LightCardConsultationData>> findWithUserAndParams(Tuple2<User,MultiValueMap<String, String>> params);

}
