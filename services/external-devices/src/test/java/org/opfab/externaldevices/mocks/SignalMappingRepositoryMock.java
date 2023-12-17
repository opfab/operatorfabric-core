/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.mocks;

import java.util.Hashtable;
import java.util.List;
import java.util.Optional;

import org.opfab.externaldevices.model.SignalMapping;
import org.opfab.externaldevices.repositories.SignalMappingRepository;

public class SignalMappingRepositoryMock implements SignalMappingRepository {

    private Hashtable<String, SignalMapping> signalMappings = new Hashtable<String, SignalMapping>();

    @Override
    public void insert(SignalMapping signalMapping) {
        this.signalMappings.put(signalMapping.id, signalMapping);
    }

    @Override
    public Optional<SignalMapping> findById(String id) {
        return Optional.ofNullable(this.signalMappings.get(id));
    }

    @Override
    public void deleteById(String id) {
        this.signalMappings.remove(id);
    }

    @Override
    public List<SignalMapping> findAll() {
        return this.signalMappings.values().stream().toList();
    }

    @Override
    public void deleteAll() {
        this.signalMappings.clear();
    }

}
