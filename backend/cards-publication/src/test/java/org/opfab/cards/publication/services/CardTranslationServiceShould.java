/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.services;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.opfab.cards.publication.model.Card;
import org.opfab.cards.publication.model.I18n;
import org.opfab.cards.publication.model.SeverityEnum;
import org.opfab.cards.publication.mocks.I18NRepositoryMock;
import org.opfab.springtools.error.model.ApiErrorException;

import java.time.Instant;
import java.util.HashMap;

import static org.assertj.core.api.Assertions.assertThat;

class CardTranslationServiceShould {

    I18NRepositoryMock i18nRepositoryMock = new I18NRepositoryMock();
    CardTranslationService cardTranslationService = new CardTranslationService(i18nRepositoryMock);

    @Test
    void translateCardField() {
        I18n i18nValue = new I18n("title", null);

        String fieldTranslated = cardTranslationService.translateCardField("process1", "1", i18nValue);
        assertThat(fieldTranslated).isEqualTo("Title translated");
    }

    @Test
    void translateCardFieldWithParameter() {
        HashMap<String, String> parameters = new HashMap<>();
        parameters.put("arg1", "with parameter");
        I18n i18nValue = new I18n("summary", parameters);

        String fieldTranslated = cardTranslationService.translateCardField("process1", "1", i18nValue);
        assertThat(fieldTranslated).isEqualTo("Summary translated with parameter");
    }

    @Test
    void translateCardFieldForNonExistingKey() {
        I18n i18nValue = new I18n("notExistingKey", null);

        String fieldTranslated = cardTranslationService.translateCardField("process1", "1", i18nValue);
        assertThat(fieldTranslated).isEqualTo("notExistingKey");
    }

    @Test
    void translateCardWithNonExistingI18nFile() {
        i18nRepositoryMock.setJsonNode(null);
        Card card = new Card();
        card.publisher = "publisher_test";
        card.processVersion = "1";
        card.processInstanceId = "cardWithProcessWithNonExistingI18nFile";
        card.severity = SeverityEnum.INFORMATION;
        card.process = "processWithNonExistingI18nFile";
        card.state = "messageState";
        card.title = new I18n("title", null);
        card.summary = new I18n("summary", null);
        card.startDate = Instant.now();

        Assertions.assertThatThrownBy(() -> {
            cardTranslationService.translate(card);
        }).isInstanceOf(ApiErrorException.class).hasMessageContaining("Impossible to publish card : no i18n file for " +
                "process=processWithNonExistingI18nFile, processVersion=1 (processInstanceId=cardWithProcessWithNonExistingI18nFile)");

    }

    @Test
    void translateCardWithNonExistingI18nKey() {
        Card card1 = new Card();
        card1.publisher = "publisher_test";
        card1.processVersion = "0";
        card1.processInstanceId = "cardWithNonExistingI18nKeyForTitle";
        card1.severity = SeverityEnum.INFORMATION;
        card1.process = "process1";
        card1.state = "messageState";
        card1.title = new I18n("nonExistingI18nKeyForTitle", null);
        card1.summary = new I18n("summary", null);
        card1.startDate = Instant.now();

        Assertions.assertThatThrownBy(() -> {
            cardTranslationService.translate(card1);
        }).isInstanceOf(ApiErrorException.class)
                .hasMessageContaining("Impossible to publish card : no i18n translation " +
                        "for key=nonExistingI18nKeyForTitle (process=process1, processVersion=0, processInstanceId=cardWithNonExistingI18nKeyForTitle)");

        Card card2 = new Card();
        card2.publisher = "publisher_test";
        card2.processVersion = "0";
        card2.processInstanceId = "cardWithNonExistingI18nKeyForSummary";
        card2.severity = SeverityEnum.INFORMATION;
        card2.process = "process1";
        card2.state = "messageState";
        card2.title = new I18n("title", null);
        card2.summary = new I18n("nonExistingI18nKeyForSummary", null);
        card2.startDate = Instant.now();

        Assertions.assertThatThrownBy(() -> {
            cardTranslationService.translate(card2);
        }).isInstanceOf(ApiErrorException.class)
                .hasMessageContaining("Impossible to publish card : no i18n translation " +
                        "for key=nonExistingI18nKeyForSummary (process=process1, processVersion=0, processInstanceId=cardWithNonExistingI18nKeyForSummary)");
    }

    @Test
    void translateCard() {
        HashMap<String, String> parameters = new HashMap<>();
        parameters.put("arg1", "with parameter");

        Card card = new Card();
        card.publisher = "publisher_test";
        card.processVersion = "0";
        card.processInstanceId = "cardWithExistingI18nKeys";
        card.severity = SeverityEnum.INFORMATION;
        card.process = "process1";
        card.state = "messageState";
        card.title = new I18n("title", null);
        card.summary = new I18n("summary", parameters);
        card.startDate = Instant.now();

        cardTranslationService.translate(card);
        assertThat(card.titleTranslated).isEqualTo("Title translated");
        assertThat(card.summaryTranslated).isEqualTo("Summary translated with parameter");
    }
}
