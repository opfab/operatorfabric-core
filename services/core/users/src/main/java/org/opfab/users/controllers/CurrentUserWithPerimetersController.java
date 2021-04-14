/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.users.controllers;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.users.configuration.oauth2.UserExtractor;
import org.lfenergy.operatorfabric.users.model.*;
import org.lfenergy.operatorfabric.users.repositories.EntityRepository;
import org.lfenergy.operatorfabric.users.services.UserServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * CurrentUserWithPerimetersController, documented at {@link CurrentUserWithPerimetersApi}
 */
@RestController
@RequestMapping("/CurrentUserWithPerimeters")
@Slf4j
public class CurrentUserWithPerimetersController implements CurrentUserWithPerimetersApi, UserExtractor {

    @Autowired
    private UserServiceImp userService;

    @Autowired
    private EntityRepository entityRepository;

    @Override
    public CurrentUserWithPerimeters fetchCurrentUserWithPerimeters(HttpServletRequest request, HttpServletResponse response) throws Exception {

        User userData = extractUserFromJwtToken(request);
        CurrentUserWithPerimetersData currentUserWithPerimetersData = new CurrentUserWithPerimetersData();
        if (userData != null) {
            currentUserWithPerimetersData.setUserData(userData);
            handleGroups(userData, currentUserWithPerimetersData);
            handleEntities(userData);
        }
        return currentUserWithPerimetersData;
    }

    protected void handleGroups(User userData, CurrentUserWithPerimetersData userWithPerimeterData) {
        List<String> groups = userData.getGroups(); //First, we recover the groups to which the user belongs

        //We recover the user_settings to have the process/state filters defined by the user, for his feed
        userWithPerimeterData.setProcessesStatesNotNotified(
                userService.retrieveUserSettings(userData.getLogin()).getProcessesStatesNotNotified());

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
                userWithPerimeterData.computePerimeters(perimetersData);
            }
        }
    }
/*
    by convention there can not be cycles within Entity relationship
    this function adds transitive entity references to the declared user entity list
 */
    protected void handleEntities(User userData) {
        List<String> userEntityList = userData.getEntities();
        Set<String> userEntityNames = userEntityList.stream().collect(Collectors.toSet());
        List<EntityData> systemEntities = entityRepository.findAll();
        Map<String, EntityData> systemEntityDictionary = systemEntities.stream()
                .collect(Collectors.toMap(Entity::getId, Function.identity()));
        userEntityList.stream().forEach(entityName -> {
            this.manageParentsRef(entityName, systemEntityDictionary, userEntityNames);
        });
        userData.setEntities(userEntityNames.stream().collect(Collectors.toList()));

    }
// recursive because by convention there are no cycle in entity relationship (cf above)
    protected void manageParentsRef(String entity, Map<String, EntityData> dictionary, Set<String> records) {
        EntityData entityRef = dictionary.get(entity);
        if (entityRef != null) {
            entityRef.getParents().stream().forEach(parentName -> {
                if (!records.contains(parentName)) {
                    this.manageParentsRef(parentName, dictionary, records);
                    records.add(parentName);
                }
            });
        }
    }
}
