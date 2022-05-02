/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.cards.publication.services.clients;

import java.util.Optional;

import org.opfab.cards.publication.model.CardPublicationData;
import org.springframework.security.oauth2.jwt.Jwt;

public interface ExternalAppClient {
    void sendCardToExternalApplication(CardPublicationData card, Optional<Jwt> jwt) ;
    void notifyExternalApplicationThatCardIsDeleted(CardPublicationData card, Optional<Jwt> jwt) ;
}
