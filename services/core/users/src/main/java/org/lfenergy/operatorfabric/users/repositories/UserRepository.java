/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.users.repositories;

import org.lfenergy.operatorfabric.users.model.UserData;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Mongo {@link UserData} repository
 */
@Repository
public interface UserRepository extends MongoRepository<UserData,String> {

    Page<UserData> findAll(Pageable pageable);
    List<UserData> findByGroupSetContaining(String groupContains);
    List<UserData> findByEntitiesContaining(String entityContains);
}
