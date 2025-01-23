/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.configuration.webflux;

import org.opfab.cards.consultation.model.Card;
import org.opfab.cards.consultation.services.ConnectedRecipientsPreviewService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.web.reactive.function.server.*;

import java.util.List;

@Configuration
public class ConnectedRecipientsPreviewRoutesConfig implements UserExtractor {

    private final ConnectedRecipientsPreviewService connectedRecipientsPreviewService;
    
    public ConnectedRecipientsPreviewRoutesConfig(ConnectedRecipientsPreviewService connectedRecipientsPreviewService) {
        this.connectedRecipientsPreviewService = connectedRecipientsPreviewService;
    }

    @Bean
    public RouterFunction<ServerResponse> connectedRecipientsPreviewRoutes() {
        return RouterFunctions
                .route(RequestPredicates.POST("/cards/connectedRecipientsPreview"), connectedRecipientsPreviewPostRoutes());
    }

    private HandlerFunction<ServerResponse> connectedRecipientsPreviewPostRoutes() {
        return request -> request.bodyToMono(Card.class)
                            .flatMap(requestBody -> {
                                List<String> connectedRecipients = this.connectedRecipientsPreviewService.getConnectedRecipients(requestBody); 
                                return ServerResponse.ok().bodyValue(connectedRecipients);
                            });
    }

}
