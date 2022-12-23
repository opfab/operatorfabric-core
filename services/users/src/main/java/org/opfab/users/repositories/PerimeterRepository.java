/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
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
import org.opfab.users.model.Perimeter;

public interface PerimeterRepository {

    public List<Perimeter> saveAll(List<Perimeter> perimeters);

    public List<Perimeter> findAll();

    public Perimeter insert(Perimeter perimeter);

    public Perimeter save(Perimeter perimeter);

    public Optional<Perimeter> findById(String id);

    public void delete(Perimeter perimeter);

    public void deleteAll();
}
