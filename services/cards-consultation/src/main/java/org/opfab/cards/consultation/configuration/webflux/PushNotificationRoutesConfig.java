/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.configuration.webflux;

import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpResponse;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.jose4j.lang.JoseException;
import org.opfab.cards.consultation.controllers.PushNotificationController;
import org.opfab.cards.consultation.model.PushSubscriptionData;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.*;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;


import java.io.IOException;
import java.net.URLDecoder;
import java.security.GeneralSecurityException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.Security;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;
import java.util.concurrent.ExecutionException;

import static org.springframework.web.reactive.function.server.ServerResponse.ok;

@Slf4j
@Configuration
public class PushNotificationRoutesConfig implements UserExtractor {

    private PushNotificationController pushNotificationController;

    public PushNotificationRoutesConfig(PushNotificationController pushNotificationController) {
        this.pushNotificationController = pushNotificationController;
    }

    @Bean
    public RouterFunction<ServerResponse> pushNotificationRoutes() {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
        return RouterFunctions
                .route(RequestPredicates.POST("/notification/subscription"), subscribe())
                .andRoute(RequestPredicates.DELETE("/notification/subscription/{endpoint}"), unsubscribe());
    }

    private HandlerFunction<ServerResponse> subscribe() {
        return request -> request.bodyToFlux(PushSubscriptionData.class)
                .zipWith(extractUserFromJwtToken(request))
                .doOnNext(t2 -> pushNotificationController.saveSubscription( t2.getT2().getUserData().getLogin(), t2.getT1()))
                .then(ok().contentType(MediaType.APPLICATION_JSON).build());
    }

    private HandlerFunction<ServerResponse> unsubscribe() {
        return request -> extractUserFromJwtToken(request)
                .doOnNext(t1 -> pushNotificationController.deleteSubscription( URLDecoder.decode(new String(Base64.getDecoder().decode(request.pathVariable("endpoint")))), t1.getUserData().getLogin()))
                .then(ok().contentType(MediaType.APPLICATION_JSON).build());
    }

}
