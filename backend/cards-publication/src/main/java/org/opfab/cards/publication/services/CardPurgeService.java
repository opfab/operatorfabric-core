/* Copyright (c) 2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.services;

import org.opfab.cards.publication.configuration.CardPurgeProperties;
import org.opfab.cards.publication.repositories.CardRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class CardPurgeService {

    private final CardRepository cardRepository;
    private final CardRepository archivedCardRepository;
    private final CardPurgeProperties purgeProperties;

    public CardPurgeService(CardRepository cardRepository,
                            CardRepository archivedCardRepository,
                            CardPurgeProperties purgeProperties) {
        this.cardRepository = cardRepository;
        this.archivedCardRepository = archivedCardRepository;
        this.purgeProperties = purgeProperties;
    }

    public void purgeIfNeeded() {

        if (!purgeProperties.isActivate()) {
            return;
        }

        Instant now = Instant.now();

        purgeCards(now);
        purgeArchivedCards(now);
    }

    private void purgeCards(Instant now) {

        Instant purgeDateLimit = now.minus(purgeProperties.getDefaultDaysToKeepCardsAfterPublication(),
                ChronoUnit.DAYS);

        cardRepository.deleteCardsByPublishDateBefore(purgeDateLimit);
    }

    private void purgeArchivedCards(Instant now) {

        Instant purgeDateLimit = now.minus(
                purgeProperties.getDefaultDaysToKeepArchivesCardsAfterPublication(),
                ChronoUnit.DAYS);

        Instant updateLimit = now.minus(
                purgeProperties.getDefaultDaysToKeepCardsAfterPublication(),
                ChronoUnit.DAYS);

        archivedCardRepository.deleteArchivedCardsByPublishDateBefore(purgeDateLimit);
        archivedCardRepository.updateDeletionDateForArchives(updateLimit);
    }
}
