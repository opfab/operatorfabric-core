/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.users.mongo.repositories;

import org.opfab.users.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Mongo {@link User} repository
 */
@Repository
public interface MongoUserRepository extends MongoRepository<User,String> {

    Page<User> findAll(Pageable pageable);
    Optional<User> findByLogin(String login);
    List<User> findByGroupSetContaining(String groupContains);
    List<User> findByEntitiesContaining(String entityContains);
}
