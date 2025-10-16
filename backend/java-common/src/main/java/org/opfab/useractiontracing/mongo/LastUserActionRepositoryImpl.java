/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.useractiontracing.mongo;

import org.opfab.useractiontracing.model.LastUserAction;
import org.opfab.useractiontracing.repositories.LastUserActionRepository;
import org.springframework.data.domain.*;

import java.util.List;
import java.util.Optional;


public class LastUserActionRepositoryImpl implements LastUserActionRepository {

    private final MongoLastUserActionRepository repository;

    public LastUserActionRepositoryImpl(MongoLastUserActionRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<LastUserAction> findAll() {
        return repository.findAll(Sort.by("lastActionDate").descending());
    }

    @Override
    public LastUserAction save(LastUserAction lastUserAction) {
        return repository.save(lastUserAction);
    }

    @Override
    public Optional<LastUserAction> findById(String id) {
        return repository.findById(id);
    }

}
