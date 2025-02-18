/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.consultation.services;

import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.time.Instant;

import org.opfab.springtools.configuration.oauth.UserServiceCache;
import org.opfab.users.model.CurrentUserWithPerimeters;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;


@Slf4j
@EqualsAndHashCode
public class CardSubscription {

    private Instant lastHearbeatReceptionDate;
    private CurrentUserWithPerimeters currentUserWithPerimeters;
    @Getter
    private String id;
    @Getter
    private Flux<String> publisher;
    private FluxSink<String> messageSink;

    private String userLogin;

    private UserServiceCache userServiceCache;


    /**
     * Constructs a card subscription and init access to AMQP exchanges
     */
    @Builder
    public CardSubscription(UserServiceCache userServiceCache, CurrentUserWithPerimeters currentUserWithPerimeters,
                            String clientId) {
        userLogin = currentUserWithPerimeters.getUserData().getLogin();
        this.id = computeSubscriptionId(userLogin, clientId);
        this.currentUserWithPerimeters = currentUserWithPerimeters;
        this.lastHearbeatReceptionDate = Instant.now();
        this.userServiceCache = userServiceCache;

    }

    public String getUserLogin()
    {
        return userLogin;
    }
    
    public CurrentUserWithPerimeters getCurrentUserWithPerimeters() {
        if (userServiceCache != null) {
            try {
                currentUserWithPerimeters = userServiceCache.fetchCurrentUserWithPerimetersFromCacheOrProxy(userLogin);
            } catch (InterruptedException exc) {
                log.info("Interrupted exception if fetch fetchCurrentUserWithPerimetersFromCacheOrProxy {}", userLogin);
                Thread.currentThread().interrupt();
               
            } catch (Exception exc) {
                // This situation arises when the user cache has been cleared and the token is expired
                // in this case, the service cannot retrieve the user information
                // it arises only in implicit mode as the user is not disconnected
                // if the token expired due to the silent refresh mechanism
                //
                // When the user will make another request (for example: click on a card feed)
                // the new token will be set and it will then retrieve user information on the next call
                //
                log.info("Cannot get new perimeter for user {}, use old one", userLogin);
            }
        }
        return currentUserWithPerimeters;
    }
 
    public static String computeSubscriptionId(String prefix, String clientId) {
        return prefix + "#" + clientId;
    }


    public void initSubscription(boolean sendReload, Runnable doOnCancel) {
        this.publisher = Flux.create(emitter -> {
            log.info("Create subscription for user {}", userLogin);
            this.messageSink = emitter;
            emitter.onRequest(v -> log.debug("Starting subscription for user {}", userLogin));
            emitter.onDispose(() -> {
                log.info("Disposing subscription for user {}", userLogin);
                doOnCancel.run();
            });
            emitter.next("INIT");
            if (sendReload)
                emitter.next("RELOAD");
        });

    }

    
    public void publishDataIntoSubscription(String message)
    {
        if (this.messageSink != null) this.messageSink.next(message);
    }

    public void publishOldCardsIntoSubscription(Flux<String> messageFlux) {
        messageFlux.doOnComplete(() -> this.messageSink.next("OLD_CARDS_LOADING_END"))
            .subscribe(next -> this.messageSink.next(next));
    }
    public void setHeartbeatReceptionDate(Instant date){
        this.lastHearbeatReceptionDate = date;
    }

    public Instant getHeartbeatReceptionDate(){
        return this.lastHearbeatReceptionDate;
    }

}
