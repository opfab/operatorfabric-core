/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.stubs;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.opfab.users.model.Perimeter;
import org.opfab.users.model.PerimeterData;
import org.opfab.users.repositories.PerimeterRepository;

public class PerimeterRepositoryStub implements PerimeterRepository {

    Map<String, Perimeter> perimeters = new HashMap<>();

    @Override
    public List<Perimeter> saveAll(List<Perimeter> perimetersToSave) {
        perimetersToSave.forEach((perimeter) -> perimeters.put(perimeter.getId(), clonePerimeter(perimeter)));
        return null;
    }

    @Override
    public List<Perimeter> findAll() {
        return perimeters.values().stream().map(perimeter -> clonePerimeter(perimeter)).toList();
    }

    @Override
    public Perimeter insert(Perimeter perimeter) {
        perimeters.put(perimeter.getId(), clonePerimeter(perimeter));
        return null;
    }

    @Override
    public Perimeter save(Perimeter perimeter) {
        perimeters.put(perimeter.getId(), clonePerimeter(perimeter));
        return perimeter;
    }

    @Override
    public Optional<Perimeter> findById(String id) {
        Perimeter perimeter = perimeters.get(id);
        if (perimeter == null)
            return Optional.empty();
        return Optional.of(clonePerimeter(perimeter));
    }

    @Override
    public void deleteAll() {
        perimeters.clear();

    }

    @Override
    public void delete(Perimeter perimeter) {
        perimeters.remove(perimeter.getId());

    }

        // Use this method to create copy of a group to avoid 
    // test code modifying repository data directly (without calling repository methods)
    private Perimeter clonePerimeter(Perimeter group) {
        return (new PerimeterData((PerimeterData) group)); 
    } 
}
