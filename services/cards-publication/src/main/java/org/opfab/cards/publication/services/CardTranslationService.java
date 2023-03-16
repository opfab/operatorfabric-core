/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.publication.services;

import java.io.IOException;

import com.fasterxml.jackson.databind.JsonNode;

import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.cards.publication.model.I18n;
import org.opfab.springtools.configuration.oauth.I18nProcessesCache;
import org.opfab.springtools.configuration.oauth.ProcessesCache;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.utilities.I18nTranslation;
import org.opfab.utilities.eventbus.EventBus;
import org.opfab.utilities.eventbus.EventListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import feign.FeignException;
import lombok.extern.slf4j.Slf4j;


@Service
@Slf4j
public class CardTranslationService implements EventListener{


    private I18nProcessesCache i18nProcessesCache;
    private ProcessesCache processesCache;


    public static final String NO_I18N_FOR_KEY = "Impossible to publish card : no i18n translation for key=%1$s (process=%2$s, processVersion=%3$s, processInstanceId=%4$s)";
    public static final String NO_I18N_FILE = "Impossible to publish card : no i18n file for process=%1$s, processVersion=%2$s (processInstanceId=%3$s)";

    @Value("${authorizeToSendCardWithInvalidProcessState:false}") boolean authorizeToSendCardWithInvalidProcessState;


    public CardTranslationService(I18nProcessesCache i18nProcessesCache,ProcessesCache processesCache, EventBus eventBus) {
        this.i18nProcessesCache = i18nProcessesCache;
        this.processesCache = processesCache;
        eventBus.addListener("process",this);
    }
    
    public void translate(CardPublicationData card) throws ApiErrorException {

        try {
            JsonNode i18n = i18nProcessesCache.fetchProcessI18nFromCacheOrProxy(card.getProcess(), card.getProcessVersion());
            I18nTranslation translation = new I18nTranslation(i18n);

            if (!authorizeToSendCardWithInvalidProcessState) {
                checkI18nExists(translation, card.getTitle().getKey(), card.getProcess(), card.getProcessVersion(), card.getProcessInstanceId());
                checkI18nExists(translation, card.getSummary().getKey(), card.getProcess(), card.getProcessVersion(), card.getProcessInstanceId());
            }

            card.setTitleTranslated(translation.translate(card.getTitle().getKey(), card.getTitle().getParameters()));
            card.setSummaryTranslated(translation.translate(card.getSummary().getKey(), card.getSummary().getParameters()));
        } catch (FeignException | IOException ex) {
            if ((ex instanceof FeignException feignException) && (feignException.status() == HttpStatus.NOT_FOUND.value())) {
                throw new ApiErrorException(ApiError.builder()
                        .status(HttpStatus.BAD_REQUEST)
                        .message(String.format(NO_I18N_FILE, card.getProcess(), card.getProcessVersion(), card.getProcessInstanceId()))
                        .build());
            } else {
                log.error("Error getting card translation", ex);
                card.setTitleTranslated(card.getTitle().getKey());
                card.setSummaryTranslated(card.getSummary().getKey());
            }
        }
    }

    private void checkI18nExists(I18nTranslation translation, String key, String process, String processVersion, String processInstanceId) throws ApiErrorException {
        JsonNode nodeFound = translation.findNode(key);
        if (nodeFound == null) {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .message(String.format(NO_I18N_FOR_KEY, key, process,
                            processVersion, processInstanceId))
                    .build());
        }
    }

    public String translateCardField(String process, String processVersion, I18n i18nValue) {

        String translatedField = i18nValue.getKey();
        try {
            JsonNode i18n = i18nProcessesCache.fetchProcessI18nFromCacheOrProxy(process, processVersion);
            I18nTranslation translation = new I18nTranslation(i18n);
            translatedField = translation.translate(i18nValue.getKey(), i18nValue.getParameters());
        } catch (FeignException | IOException ex) {
            log.error("Error getting field translation", ex);
        }
        return translatedField;
    }

    private void clearCaches() {
        i18nProcessesCache.clearCache();
        processesCache.clearCache();
    }

    @Override
    public void onEvent(String eventKey, String message) {
       clearCaches();
    }
    
}
