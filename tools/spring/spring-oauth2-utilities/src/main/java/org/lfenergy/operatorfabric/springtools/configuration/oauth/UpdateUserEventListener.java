/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.springtools.configuration.oauth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;

/**
 * <p>Listens for {@link UpdatedUserEvent} to clear user cache for a given user.</p>
 * See issue #64
 * @author Alexandra Guironnet
 */
@Configuration
public class UpdateUserEventListener {

    @Autowired
    UserServiceCache userServiceCache;

    @EventListener
    public void handleUserUpdate(UpdatedUserEvent event) {
        userServiceCache.clearUserCache(event.getLogin());
    }
}


