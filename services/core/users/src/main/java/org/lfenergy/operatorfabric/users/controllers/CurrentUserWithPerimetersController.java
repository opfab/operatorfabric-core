/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.users.controllers;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.users.configuration.oauth2.UserExtractor;
import org.lfenergy.operatorfabric.users.model.*;
import org.lfenergy.operatorfabric.users.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.*;

/**
 * CurrentUserWithPerimetersController, documented at {@link CurrentUserWithPerimetersApi}
 *
 */
@RestController
@RequestMapping("/CurrentUserWithPerimeters")
@Slf4j
public class CurrentUserWithPerimetersController implements CurrentUserWithPerimetersApi, UserExtractor {

    @Autowired
    private UserService userService;

    @Override
    public CurrentUserWithPerimeters fetchCurrentUserWithPerimeters(HttpServletRequest request, HttpServletResponse response) throws Exception{

        User userData = extractUserFromJwtToken(request);
        if (userData != null) {
            List<String> groups = userData.getGroups(); //First, we recover the groups to which the user belongs
            CurrentUserWithPerimetersData currentUserWithPerimetersData = CurrentUserWithPerimetersData.builder().userData(userData).build();

            if ((groups != null) && (!groups.isEmpty())) {     //Then, we recover the groups data
                List<GroupData> groupsData = userService.retrieveGroups(groups);

                if ((groupsData != null) && (!groupsData.isEmpty())) {
                    Set<PerimeterData> perimetersData = new HashSet<>(); //We use a set because we don't want to have a duplicate
                    groupsData.forEach(     //For each group, we recover its perimeters
                            groupData -> {
                                List<PerimeterData> list = userService.retrievePerimeters(groupData.getPerimeters());
                                if (list != null)
                                    perimetersData.addAll(list);
                            });
                    currentUserWithPerimetersData.computePerimeters(perimetersData);
                    return currentUserWithPerimetersData;
                }
            }
        }
        return null;
    }
}
