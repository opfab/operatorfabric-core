/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.controllers;


import org.opfab.springtools.configuration.mongo.PaginationUtils;
import org.opfab.useractiontracing.services.UserActionLogService;
import org.opfab.useractiontracing.model.UserActionLog;
import org.opfab.users.model.UserActionLogData;
import org.opfab.users.model.UserActionLogPage;
import org.opfab.users.model.UserActionLogPageData;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.util.MultiValueMapAdapter;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/userActionLogs")
public class UserActionLogsController implements UserActionLogsApi{

    private UserActionLogService actionService;

    public UserActionLogsController(UserActionLogService actionService) {
        this.actionService  = actionService ; 

    }

    @Override
    public UserActionLogPage getUserActionLogs(HttpServletRequest request, HttpServletResponse response, List<String> login, List<String> action, BigDecimal dateFrom, BigDecimal dateTo, BigDecimal page, BigDecimal size) throws Exception {
        Pageable pageable = PaginationUtils.createPageable(page != null ? page.intValue() : null , size != null ? size.intValue() : null);
        Map<String, List<String>> queryParams = new HashMap<>();
        if (login != null)
            queryParams.put("login", login);
        if (action != null)
            queryParams.put("action", action);
        if (dateFrom != null)
            queryParams.put("dateFrom", Arrays.asList(dateFrom.toString()));
        if (dateTo != null)
            queryParams.put("dateTo", Arrays.asList(dateTo.toString()));
        Page<UserActionLog> actionsPage = actionService.getUserActionLogsByParams(new MultiValueMapAdapter<>(queryParams), pageable);

        return UserActionLogPageData.builder()
                .content(actionsPage.getContent().stream().map(UserActionLogData::new).collect(Collectors.toList()))
                .size(BigDecimal.valueOf(actionsPage.getSize()))
                .totalElements(BigDecimal.valueOf(actionsPage.getTotalElements()))
                .totalPages(BigDecimal.valueOf(actionsPage.getTotalPages()))
                .number(BigDecimal.valueOf(actionsPage.getNumber()))
                .numberOfElements(BigDecimal.valueOf(actionsPage.getNumberOfElements()))
                .first(actionsPage.isFirst())
                .last(actionsPage.isLast())
                .build();
    }


}
