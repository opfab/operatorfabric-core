
/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
* See AUTHORS.txt
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
* SPDX-License-Identifier: MPL-2.0
* This file is part of the OperatorFabric project.
*/

package org.opfab.cards.publication.configuration;

import java.util.Optional;

import org.opfab.cards.publication.repositories.CardRepository;
import org.opfab.cards.publication.repositories.I18NRepository;
import org.opfab.cards.publication.repositories.I18NRepositoryImpl;
import org.opfab.cards.publication.repositories.ProcessRepositoryImpl;
import org.opfab.cards.publication.services.CardDeletionService;
import org.opfab.cards.publication.services.CardNotificationService;
import org.opfab.cards.publication.services.CardProcessingService;
import org.opfab.cards.publication.services.CardTranslationService;
import org.opfab.cards.publication.services.CardValidationService;
import org.opfab.cards.publication.services.ExternalAppService;
import org.opfab.useractiontracing.services.UserActionLogService;
import org.opfab.utilities.eventbus.EventBus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class Services {

    private final CardDeletionService cardDeletionService;

    private final CardProcessingService cardProcessingService;

    private final CardTranslationService cardTranslationService;

    private final UserActionLogService userActionLogService;

    private final CardValidationService cardValidationService;

    Services(
            UserActionLogService userActionLogService,
            CardRepository cardRepository,
            ExternalAppService externalAppService,
            Optional<I18NRepository> i18nRepository,
            EventBus eventBus,
            ObjectMapper objectMapper,
            @Value("${operatorfabric.cards-publication.checkAuthenticationForCardSending:true}") boolean checkAuthenticationForCardSending,
            @Value("${operatorfabric.cards-publication.checkPerimeterForCardSending:true}") boolean checkPerimeterForCardSending,
            @Value("${operatorfabric.cards-publication.authorizeToSendCardWithInvalidProcessState:false}") boolean authorizeToSendCardWithInvalidProcessState,
            @Value("${operatorfabric.cards-publication.cardSendingLimitCardCount:1000}") int cardSendingLimitCardCount,
            @Value("${operatorfabric.cards-publication.cardSendingLimitPeriod:3600}") int cardSendingLimitPeriod,
            @Value("${operatorfabric.cards-publication.activateCardSendingLimiter:true}") boolean activateCardSendingLimiter,
            @Value("${operatorfabric.servicesUrls.businessconfig:http://businessconfig:2100}") String businessconfigUrl,
            CustomScreenDataFields customScreenDataFields) {

        if (!i18nRepository.isPresent()) {
            this.cardTranslationService = new CardTranslationService(
                    new I18NRepositoryImpl(eventBus, businessconfigUrl));
        } else {
            this.cardTranslationService = new CardTranslationService(i18nRepository.get());
        }
        this.userActionLogService = userActionLogService;
        CardNotificationService cardNotificationService = new CardNotificationService(eventBus, objectMapper, customScreenDataFields);
        cardValidationService = new CardValidationService(cardRepository,
                new ProcessRepositoryImpl(businessconfigUrl, eventBus));
        cardDeletionService = new CardDeletionService(cardNotificationService, cardRepository, externalAppService,
                checkAuthenticationForCardSending);
        cardProcessingService = new CardProcessingService(cardDeletionService, cardNotificationService,
                cardRepository, externalAppService,
                cardTranslationService, cardValidationService, checkAuthenticationForCardSending,
                checkPerimeterForCardSending,
                authorizeToSendCardWithInvalidProcessState, cardSendingLimitCardCount, cardSendingLimitPeriod,
                activateCardSendingLimiter);

    }

    public CardDeletionService getCardDeletionService() {
        return cardDeletionService;
    }

    public CardValidationService getCardValidationService() {
        return cardValidationService;
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
