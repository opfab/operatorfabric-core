/* Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
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

import org.opfab.cards.publication.model.Card;
import org.opfab.cards.publication.model.I18n;
import org.opfab.cards.publication.repositories.I18NRepository;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.utilities.I18nTranslation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class CardTranslationService {

    private I18NRepository i18NRepository;

    public static final String NO_I18N_FOR_KEY = "Impossible to publish card : no i18n translation for key=%1$s (process=%2$s, processVersion=%3$s, processInstanceId=%4$s)";
    public static final String NO_I18N_FILE = "Impossible to publish card : no i18n file for process=%1$s, processVersion=%2$s (processInstanceId=%3$s)";

    @Value("${operatorfabric.cards-publication.authorizeToSendCardWithInvalidProcessState:false}")
    boolean authorizeToSendCardWithInvalidProcessState;

    public CardTranslationService(I18NRepository i18NRepository) {
        this.i18NRepository = i18NRepository;

    }

    public void translate(Card card) throws ApiErrorException {

        try {
            JsonNode i18n = i18NRepository.getI18n(card.getProcess(), card.getProcessVersion());
            if (i18n == null) {
                throw new ApiErrorException(ApiError.builder()
                        .status(HttpStatus.BAD_REQUEST)
                        .message(String.format(NO_I18N_FILE, card.getProcess(), card.getProcessVersion(),
                                card.getProcessInstanceId()))
                        .build());
            }
            I18nTranslation translation = new I18nTranslation(i18n);

            if (!authorizeToSendCardWithInvalidProcessState) {
                checkI18nExists(translation, card.getTitle().key(), card.getProcess(), card.getProcessVersion(),
                        card.getProcessInstanceId());
                checkI18nExists(translation, card.getSummary().key(), card.getProcess(), card.getProcessVersion(),
                        card.getProcessInstanceId());
            }

            card.setTitleTranslated(translation.translate(card.getTitle().key(), card.getTitle().parameters()));
            card.setSummaryTranslated(translation.translate(card.getSummary().key(), card.getSummary().parameters()));
        } catch (InterruptedException ex) {
            log.error("Error getting card translation (Interrupted Exception)", ex);
            Thread.currentThread().interrupt();
        } catch (IOException ex) {
            log.error("Error getting card translation", ex);
            card.setTitleTranslated(card.getTitle().key());
            card.setSummaryTranslated(card.getSummary().key());
        }
    }

    private void checkI18nExists(I18nTranslation translation, String key, String process, String processVersion,
            String processInstanceId) throws ApiErrorException {
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

        String translatedField = i18nValue.key();
        try {
            JsonNode i18n = i18NRepository.getI18n(process, processVersion);
            I18nTranslation translation = new I18nTranslation(i18n);
            translatedField = translation.translate(i18nValue.key(), i18nValue.parameters());
        } catch (InterruptedException ex) {
            log.error("Error getting field translation (Interrupted Exception)", ex);
            Thread.currentThread().interrupt();
        } catch (IOException ex) {
            log.error("Error getting field translation", ex);
        }
        return translatedField;
    }

}
