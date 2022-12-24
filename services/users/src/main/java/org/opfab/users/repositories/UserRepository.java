/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.users.repositories;

import java.util.List;
import java.util.Optional;

import org.opfab.users.model.User;

public interface UserRepository {

    public List<User> saveAll(List<User> users);

    public List<User> findAll();

    public User insert(User user);

    public User save(User user);

    public Optional<User> findById(String id);

    public void delete(User user);

    public void deleteAll();

    public List<User> findByGroupSetContaining(String groupContains);

    public List<User> findByEntitiesContaining(String entityContains);
}
