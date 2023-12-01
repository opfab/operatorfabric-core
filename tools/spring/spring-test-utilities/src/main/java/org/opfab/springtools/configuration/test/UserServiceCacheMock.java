/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.springtools.configuration.test;

import java.io.IOException;

import org.opfab.springtools.configuration.oauth.UserServiceCache;
import org.opfab.users.model.CurrentUserWithPerimeters;

public class UserServiceCacheMock implements UserServiceCache{

    @Override
    public void setTokenForUserRequest(String user, String token) {
        throw new UnsupportedOperationException("Unimplemented method 'setTokenForUserRequest'");
    }

    @Override
    public CurrentUserWithPerimeters fetchCurrentUserWithPerimetersFromCacheOrProxy(String user)
            throws IOException, InterruptedException {
        throw new UnsupportedOperationException("Unimplemented method 'fetchCurrentUserWithPerimetersFromCacheOrProxy'");
    }

    @Override
    public void clearUserCache() {

        throw new UnsupportedOperationException("Unimplemented method 'clearUserCache'");
    }

    @Override
    public void clearUserCache(String principalId) {
        throw new UnsupportedOperationException("Unimplemented method 'clearUserCache'");
    }
    
}
