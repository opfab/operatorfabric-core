/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.useractiontracing.services;

import org.opfab.useractiontracing.model.UserActionLog;
import org.opfab.useractiontracing.repositories.UserActionLogRepository;
import org.opfab.useractiontracing.model.UserActionEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;

import lombok.extern.slf4j.Slf4j;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
public class UserActionLogService {

    private UserActionLogRepository userActionLogRepository;

    public UserActionLogService(UserActionLogRepository userActionLogRepository) {
        this.userActionLogRepository = userActionLogRepository;
    }

    public void insertUserActionLog(String login, UserActionEnum actionType, List<String> entities, String cardUid,
            String comment) {
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
        return this.userActionLogRepository.findAll();
    }

    public Page<UserActionLog> getUserActionLogsByParams(MultiValueMap<String, String> params, Pageable pageable) {
        return this.userActionLogRepository.findByParams(params, pageable);
    }

    public void deleteLogsByExpirationDate(Integer daysStored) {     
        Instant expirationDate = Instant.now().minus(daysStored, ChronoUnit.DAYS);
        this.userActionLogRepository.deleteExpiredLogs(expirationDate);
        log.info(String.format("User action logs older than %2d days have been deleted", daysStored));
    }

}
