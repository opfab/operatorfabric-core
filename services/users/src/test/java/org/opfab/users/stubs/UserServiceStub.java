
/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.stubs;

import java.util.List;
import java.util.Set;

import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.users.model.Group;
import org.opfab.users.model.Perimeter;
import org.opfab.users.model.PerimeterData;
import org.opfab.users.model.User;
import org.opfab.users.model.UserData;
import org.opfab.users.model.UserSettings;
import org.opfab.users.model.UserSettingsData;
import org.opfab.users.services.UserService;

public class UserServiceStub implements UserService {


    public User user;
    public UserData userData;
    public UserSettingsData userSettingsData;
    public List<Group> groups;
    public List<PerimeterData> perimeters; 
    public Set<Perimeter> perimetersAttachedToGroups;


    @Override
    public User createUser(User user) {
        return user ;
    }

    @Override
    public UserData retrieveUser(String login) {
        return userData;
    }

    @Override
    public UserSettingsData retrieveUserSettings(String login) {
        return userSettingsData;
    }

    @Override
    public List<Group> retrieveGroups(List<String> groupIds) {
        return groups;
    }

    @Override
    public List<PerimeterData> retrievePerimeters(List<String> perimeterIds) {
        return perimeters;
    }

    @Override
    public Set<Perimeter> findPerimetersAttachedToGroups(List<String> groups) {
        return perimetersAttachedToGroups;
    }

    @Override
    public boolean checkFilteringNotificationIsAllowedForAllProcessesStates(String login, UserSettings userSettings) {

        return false;
    }

    @Override
    public void publishUpdatedUserMessage(String userLogin) {
        // stub 
        
    }

    @Override
    public void publishUpdatedGroupMessage(String id) {
        //stub
    }

    @Override
    public void publishUpdatedConfigMessage() {
        // stub
        
    }

    @Override
    public void checkFormatOfIdField(String id) throws ApiErrorException {
        // stub
        
    }

    @Override
    public void checkFormatOfLoginField(String login) throws ApiErrorException {
        // stub
        
    }
    
}
