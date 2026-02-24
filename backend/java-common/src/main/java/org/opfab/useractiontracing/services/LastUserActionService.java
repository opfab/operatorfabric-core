/* Copyright (c) 2025-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.useractiontracing.services;

import org.opfab.useractiontracing.model.LastUserAction;
import org.opfab.useractiontracing.repositories.LastUserActionRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class LastUserActionService {

    private LastUserActionRepository lastUserActionRepository;

    public LastUserActionService(LastUserActionRepository lastUserActionRepository) {
        this.lastUserActionRepository = lastUserActionRepository;
    }

    public List<LastUserAction> getLastUserAction() {
        return this.lastUserActionRepository.findAll();
    }

    public LastUserAction fetchLastUserAction(String login) {
        Optional<LastUserAction> lastUserAction = lastUserActionRepository.findById(login);
        return lastUserAction.orElse(null);
    }

    public List<LastUserAction> getLastUserActionOlderThan(Instant date) {
        return this.lastUserActionRepository.findByLastActionDateBefore(date);
    }

}
