/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.useractiontracing.services;

import org.opfab.useractiontracing.model.UserActionLog;
import org.opfab.useractiontracing.model.UserActionEnum;
import org.opfab.useractiontracing.repositories.UserActionLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;

import java.time.Instant;
import java.util.List;

@Service
public class UserActionLogService {

    private UserActionLogRepository userActionLogRepository;

    public UserActionLogService(UserActionLogRepository userActionLogRepository) {
        this.userActionLogRepository = userActionLogRepository;
    }

    public void insertUserActionLog(String login, UserActionEnum actionType, List<String> entities, String cardUid, String comment) {
        UserActionLog action = UserActionLog.builder().login(login)
                .action(actionType)
                .date(Instant.now())
                .entities(entities)
                .cardUid(cardUid)
                .comment(comment)
                .build();
        this.insertUserActionLog(action);
    }
    public void insertUserActionLog(UserActionLog action) {
        this.userActionLogRepository.save(action);
    }

    public List<UserActionLog> getUserActionLogs() {
        return this.userActionLogRepository.findAll(Sort.by("date").descending());
    }

    public Page<UserActionLog> getUserActionLogsByParams(MultiValueMap<String, String> params, Pageable pageable) {
        return this.userActionLogRepository.findByParams(params, pageable);
    }

}
