/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.springtools.configuration.oauth;

import org.springframework.cloud.bus.event.RemoteApplicationEvent;

/**
 * <p>Custom event fired by users-business-service when a user is updated.</p>
 * See issue #64
 *
 *
 */
public class UpdatedUserEvent extends RemoteApplicationEvent {

    /**
     * Updated user login
     * */
    private String login;

    protected UpdatedUserEvent() {
    }

    public UpdatedUserEvent(Object source, String originService, String name) {
        super(source, originService);
        this.login = name;
    }

    public String getLogin() {
        return this.login;
    }

    public void setLogin(String name) {
        this.login = name;
    }


}

