/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.users.repositories;

import org.lfenergy.operatorfabric.users.model.PerimeterData;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Mongo {@link PerimeterData} repository
 */
@Repository
public interface PerimeterRepository extends MongoRepository<PerimeterData, String> {
    Page<PerimeterData> findAll(Pageable pageable);
}

