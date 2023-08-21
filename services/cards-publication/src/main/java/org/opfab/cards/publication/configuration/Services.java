
/* Copyright (c) 2023, RTE (http://www.rte-france.com)
* See AUTHORS.txt
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
* SPDX-License-Identifier: MPL-2.0
* This file is part of the OperatorFabric project.
*/

package org.opfab.cards.publication.configuration;

import org.opfab.cards.publication.repositories.CardRepository;
import org.opfab.cards.publication.services.CardNotificationService;
import org.opfab.cards.publication.services.CardProcessingService;
import org.opfab.cards.publication.services.CardTranslationService;
import org.opfab.cards.publication.services.ExternalAppService;
import org.opfab.springtools.configuration.oauth.I18nProcessesCache;
import org.opfab.springtools.configuration.oauth.ProcessesCache;
import org.opfab.useractiontracing.services.UserActionLogService;
import org.opfab.utilities.eventbus.EventBus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class Services {

    private final CardProcessingService cardProcessingService;

    private final CardTranslationService cardTranslationService;

    private final UserActionLogService userActionLogService;

    Services(
            UserActionLogService userActionLogService,
            CardRepository cardRepository,
            ExternalAppService externalAppService,
            I18nProcessesCache i18nProcessesCache, ProcessesCache processesCache, EventBus eventBus,
            ObjectMapper objectMapper,
            @Value("${operatorfabric.cards-publication.checkAuthenticationForCardSending:true}") boolean checkAuthenticationForCardSending,
            @Value("${operatorfabric.cards-publication.checkPerimeterForCardSending:true}") boolean checkPerimeterForCardSending,
            @Value("${operatorfabric.cards-publication.authorizeToSendCardWithInvalidProcessState:false}") boolean authorizeToSendCardWithInvalidProcessState,
            @Value("${cardSendingLimitCardCount:1000}") int cardSendingLimitCardCount,
            @Value("${cardSendingLimitPeriod:3600}") int cardSendingLimitPeriod,
            @Value("${activateCardSendingLimiter:true}") boolean activateCardSendingLimiter) {
        this.cardTranslationService = new CardTranslationService(i18nProcessesCache, processesCache, eventBus);
        this.userActionLogService = userActionLogService;
        CardNotificationService cardNotificationService = new CardNotificationService(eventBus, objectMapper);
        cardProcessingService = new CardProcessingService(cardNotificationService,
                cardRepository, externalAppService,
                cardTranslationService, processesCache, checkAuthenticationForCardSending, checkPerimeterForCardSending,
                authorizeToSendCardWithInvalidProcessState, cardSendingLimitCardCount, cardSendingLimitPeriod, activateCardSendingLimiter);

    }

    public CardProcessingService getCardProcessingService() {
        return cardProcessingService;
    }

    public CardTranslationService getCardTranslationService() {
        return cardTranslationService;
    }

    public UserActionLogService getUserActionLogService() {
        return userActionLogService;
    }

}
