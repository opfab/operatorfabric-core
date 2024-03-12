/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.repositories;

import java.util.List;
import java.util.Optional;

import org.opfab.externaldevices.model.SignalMapping;

public interface SignalMappingRepository {

    public void insert(SignalMapping signalMapping);

    public Optional<SignalMapping> findById(String id);

    public void deleteById(String id);

    public void deleteAll();

    public List<SignalMapping> findAll();
}
