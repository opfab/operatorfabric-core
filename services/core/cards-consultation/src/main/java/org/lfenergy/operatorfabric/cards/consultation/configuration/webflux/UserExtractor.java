/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.lfenergy.operatorfabric.cards.consultation.configuration.webflux;

import org.lfenergy.operatorfabric.springtools.configuration.oauth.OpFabJwtAuthenticationToken;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.web.reactive.function.server.ServerRequest;
import reactor.core.publisher.Mono;

public interface UserExtractor {
    /**
     * Extracts User from Authentication request parameters
     * @param request the http request
     * @return a {@link User}
     */
    default Mono<User> extractUserFromJwtToken(ServerRequest request){
        return request.principal()
                .map( principal ->  {
                    OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
                    return (User) jwtPrincipal.getPrincipal();
                });
    }
}
