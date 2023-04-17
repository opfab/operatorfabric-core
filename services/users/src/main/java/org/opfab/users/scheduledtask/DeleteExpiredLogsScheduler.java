/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.users.scheduledtask;

import org.opfab.useractiontracing.services.UserActionLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@EnableScheduling
public class DeleteExpiredLogsScheduler {
    @Autowired
    UserActionLogService userActionLogService;

    @Value("${daysBeforeLogExpiration:61}") Integer daysBeforeLogExpiration;

    @Scheduled(cron = "${hourScheduledForLogsCleaning:0 30 0 * * *}")
    public void deleteExpiredLogs() {
        userActionLogService.deleteLogsByExpirationDate(daysBeforeLogExpiration);
    }
}
