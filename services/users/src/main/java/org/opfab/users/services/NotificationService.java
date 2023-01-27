/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.users.services;

import java.util.List;

import org.opfab.users.model.User;
import org.opfab.users.repositories.UserRepository;

public class NotificationService {

    private UserRepository userRepository;
    private EventBus eventBus;

    public NotificationService(UserRepository userRepository, EventBus eventBus) {
        this.userRepository = userRepository;
        this.eventBus = eventBus;
    }

    public void publishUpdatedGroupMessage(String groupId) {
        List<User> foundUsers = userRepository.findByGroupSetContaining(groupId);
        if (foundUsers != null && !foundUsers.isEmpty()) {
            for (User user : foundUsers)
                publishUpdatedUserMessage(user.getLogin());
        }
    }

    public void publishUpdatedConfigMessage() {
        publishUpdatedUserMessage("");
    }

    public void publishUpdatedUserMessage(String userLogin) {
        eventBus.sendEvent("USER_EXCHANGE", userLogin);
    }

}
