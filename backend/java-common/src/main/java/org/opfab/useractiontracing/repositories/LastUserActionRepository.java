/* Copyright (c) 2025-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.useractiontracing.repositories;


import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.opfab.useractiontracing.model.LastUserAction;
public interface LastUserActionRepository {

    public List<LastUserAction> findAll();

    public LastUserAction save(LastUserAction userActionLog);

    public Optional<LastUserAction> findById(String id);

    public List<LastUserAction> findByLastActionDateBefore(Instant date);
    
}
