/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.repositories;

import org.opfab.users.model.Group;

import java.util.List;
import java.util.Optional;

public interface GroupRepository {

    public List<Group> findAll();

    public Group insert(Group group);

    public Group save(Group group);

    public List<Group> saveAll(List<Group> groups);

    public Optional<Group> findById(String id);

    public void delete(Group group);

    public void deleteAll();

    public List<Group> findByPerimetersContaining(String perimeterContains);
}
