/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.controllers;

import org.opfab.actiontracing.services.UserActionLogService;
import org.opfab.users.model.ActionLog;
import org.opfab.users.model.ActionLogData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/userActionLogs")
public class ActionLogsController implements UserActionLogsApi{

    @Autowired
    private UserActionLogService actionService;

    @Override
    public List<ActionLog> getUserActionLogs(HttpServletRequest request, HttpServletResponse response) throws Exception {
        return actionService.getUserActionLogs().stream().map(ActionLogData::new).collect(Collectors.toList());
    }
}
