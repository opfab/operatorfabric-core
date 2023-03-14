/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.useractiontracing.repositories;

import java.time.Instant;

import org.opfab.useractiontracing.model.UserActionLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.util.MultiValueMap;

public interface UserActionLogCustomRepository {

    Page<UserActionLog> findByParams(MultiValueMap<String, String> params, Pageable pageable);
    abstract void deleteExpiredLogs(Instant expirationDate);

}
