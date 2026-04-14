/* Copyright (c) 2022, Alliander (http://www.alliander.com)
 * Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.scheduledtasks;

import org.opfab.cards.publication.configuration.CardPurgeProperties;
import org.opfab.cards.publication.configuration.Services;
import org.opfab.cards.publication.services.CardPurgeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@EnableScheduling
public class DeleteExpiredCardScheduler {

    private static final Logger log = LoggerFactory.getLogger(DeleteExpiredCardScheduler.class);

    private final Services services;
    private final CardPurgeService cardPurgeService;
    private final CardPurgeProperties purgeProperties;

    @Autowired
    public DeleteExpiredCardScheduler(Services services,
                                      CardPurgeService cardPurgeService,
                                      CardPurgeProperties purgeProperties) {
        this.services = services;
        this.cardPurgeService = cardPurgeService;
        this.purgeProperties = purgeProperties;
    }

    @Scheduled(fixedDelayString = "${operatorfabric.cards-publication.delayForDeleteExpiredCardsScheduling:60000}")
    public void deleteExpiredCards() {
        services.getCardDeletionService().deleteCardsByExpirationDate(Instant.now());
    }

    @Scheduled(cron = "#{@cardPurgeProperties.toCron()}")
    public void purgeCards() {
        if (!purgeProperties.isActivate()) {
            log.debug("Scheduled card purge skipped (activate=false)");
            return;
        }

        Instant start = Instant.now();
        log.info("Scheduled card purge started at {}", start);
        cardPurgeService.purgeIfNeeded();
        log.info("Scheduled card purge finished in {} ms", java.time.Duration.between(start, Instant.now()).toMillis());
    }
}
