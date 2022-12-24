/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

 package org.opfab.users.stubs;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.opfab.users.model.UserSettings;
import org.opfab.users.model.UserSettingsData;
import org.opfab.users.repositories.UserSettingsRepository;

public class UserSettingsRepositoryStub implements UserSettingsRepository{

    Map<String, UserSettings> userSettingsStorage = new HashMap<>();

    @Override
    public UserSettings save(UserSettings userSettings) {
        userSettingsStorage.put(userSettings.getLogin(), cloneUserSettings(userSettings));
        return userSettings;
    }

    @Override
    public Optional<UserSettings> findById(String id) {
        UserSettings settings = userSettingsStorage.get(id);
        if (settings == null)
            return Optional.empty();
        return Optional.of(cloneUserSettings(settings));
    }

    @Override
    public void deleteAll() {
        userSettingsStorage.clear();
        
    }
    
    private UserSettings cloneUserSettings(UserSettings settings) {
        return (new UserSettingsData((UserSettingsData) settings)); 
    } 
}
