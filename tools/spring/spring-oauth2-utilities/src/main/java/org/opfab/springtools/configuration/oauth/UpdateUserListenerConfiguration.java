/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.springtools.configuration.oauth;

import org.opfab.utilities.eventbus.EventBus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import lombok.extern.slf4j.Slf4j;


@Configuration
@Slf4j
public class UpdateUserListenerConfiguration {

    UpdateUserListener updateUserListener;

    @Autowired
    public  void initUpdateUserListener(EventBus eventbus,UserServiceCache userServiceCache) {
        log.info("Start user listener");
        updateUserListener =  new UpdateUserListener(eventbus,userServiceCache);
    }
}


