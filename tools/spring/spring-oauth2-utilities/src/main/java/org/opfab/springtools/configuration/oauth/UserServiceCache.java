/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.springtools.configuration.oauth;

import java.io.IOException;
import org.opfab.users.model.CurrentUserWithPerimeters;


public interface UserServiceCache {


    // The token is stored in the service as when the org.lfenergy.operatorfabric.cards.consultation.services.CardSubscription 
    // class call the cache , it does not have the user token 
    // it is set each time the user make a request as it can have been refresh in between 
    public void setTokenForUserRequest(String user,String token);

    public CurrentUserWithPerimeters fetchCurrentUserWithPerimetersFromCacheOrProxy(String user)  throws IOException, InterruptedException;

    public void clearUserCache();

    public void clearUserCache(String principalId);


}

