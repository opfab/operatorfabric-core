/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.externaldevices.repositories;

import org.opfab.externaldevices.model.SignalMappingData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Mongo {@link SignalMappingData} repository
 */
@Repository
public interface SignalMappingRepository extends MongoRepository<SignalMappingData,String> {

    List<SignalMappingData> findAll();

}
