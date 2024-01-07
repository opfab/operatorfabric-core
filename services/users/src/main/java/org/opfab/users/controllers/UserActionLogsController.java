/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
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
import org.opfab.users.model.UserActionLogPage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.util.MultiValueMapAdapter;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/userActionLogs")
public class UserActionLogsController {

    private UserActionLogService actionService;

    public UserActionLogsController(UserActionLogService actionService) {
        this.actionService = actionService;

    }

    @GetMapping(produces = { "application/json" })
    public UserActionLogPage getUserActionLogs(HttpServletRequest request,
            HttpServletResponse response,
            @Valid @RequestParam(value = "login", required = false) List<String> login,
            @Valid @RequestParam(value = "action", required = false) List<String> action,
            @Valid @RequestParam(value = "dateFrom", required = false) BigDecimal dateFrom,
            @Valid @RequestParam(value = "dateTo", required = false) BigDecimal dateTo,
            @Valid @RequestParam(value = "page", required = false) BigDecimal page,
            @Valid @RequestParam(value = "size", required = false) BigDecimal size)  {
        Pageable pageable = PaginationUtils.createPageable(page != null ? page.intValue() : null,
                size != null ? size.intValue() : null);
        Map<String, List<String>> queryParams = new HashMap<>();
        if (login != null)
            queryParams.put("login", login);
        if (action != null)
            queryParams.put("action", action);
        if (dateFrom != null)
            queryParams.put("dateFrom", Arrays.asList(dateFrom.toString()));
        if (dateTo != null)
            queryParams.put("dateTo", Arrays.asList(dateTo.toString()));
        Page<UserActionLog> actionsPage = actionService
                .getUserActionLogsByParams(new MultiValueMapAdapter<>(queryParams), pageable);


        UserActionLogPage userActionLogPageData = new UserActionLogPage();
        userActionLogPageData.setContent(actionsPage.getContent());
        userActionLogPageData.setSize(BigDecimal.valueOf(actionsPage.getSize()));
        userActionLogPageData.setTotalElements(BigDecimal.valueOf(actionsPage.getTotalElements()));
        userActionLogPageData.setTotalPages(BigDecimal.valueOf(actionsPage.getTotalPages()));
        userActionLogPageData.setNumber(BigDecimal.valueOf(actionsPage.getNumber()));
        userActionLogPageData.setNumberOfElements(BigDecimal.valueOf(actionsPage.getNumberOfElements()));
        userActionLogPageData.setFirst(actionsPage.isFirst());
        userActionLogPageData.setLast(actionsPage.isLast());
                
        return userActionLogPageData;
    }
}
