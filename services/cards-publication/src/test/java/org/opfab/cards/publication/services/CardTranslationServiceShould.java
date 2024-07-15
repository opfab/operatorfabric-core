/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
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
    void translateCardField(){
        I18n i18nValue = new I18n("title",null);

        String fieldTranslated = cardTranslationService.translateCardField("process1", "1", i18nValue);
        assertThat(fieldTranslated).isEqualTo("Title translated");
    }

    @Test
    void translateCardFieldWithParameter(){
        HashMap<String, String> parameters = new HashMap<>();
        parameters.put("arg1", "with parameter");
        I18n i18nValue = new I18n("summary",parameters);

        String fieldTranslated = cardTranslationService.translateCardField("process1", "1", i18nValue);
        assertThat(fieldTranslated).isEqualTo("Summary translated with parameter");
    }

    @Test
    void translateCardFieldForNonExistingKey(){
        I18n i18nValue = new I18n("notExistingKey",null);

        String fieldTranslated = cardTranslationService.translateCardField("process1", "1", i18nValue);
        assertThat(fieldTranslated).isEqualTo("notExistingKey");
    }

    @Test
    void translateCardWithNonExistingI18nFile(){
        i18nRepositoryMock.setJsonNode(null);
        Card card = Card.builder().publisher("publisher_test").processVersion("1")
                .processInstanceId("cardWithProcessWithNonExistingI18nFile").severity(SeverityEnum.INFORMATION)
                .process("processWithNonExistingI18nFile")
                .state("messageState")
                .title(new I18n("title",null))
                .summary(new I18n("summary",null))
                .startDate(Instant.now())
                .build();

        Assertions.assertThatThrownBy(() -> {
            cardTranslationService.translate(card);
        }).isInstanceOf(ApiErrorException.class).hasMessageContaining("Impossible to publish card : no i18n file for " +
                "process=processWithNonExistingI18nFile, processVersion=1 (processInstanceId=cardWithProcessWithNonExistingI18nFile)");

    }

    @Test
    void translateCardWithNonExistingI18nKey(){
        Card card1 = Card.builder().publisher("publisher_test").processVersion("0")
                .processInstanceId("cardWithNonExistingI18nKeyForTitle").severity(SeverityEnum.INFORMATION)
                .process("process1")
                .state("messageState")
                .title(new I18n("nonExistingI18nKeyForTitle",null))
                .summary(new I18n("summary",null))
                .startDate(Instant.now())
                .build();

        Assertions.assertThatThrownBy(() -> {
            cardTranslationService.translate(card1);
        }).isInstanceOf(ApiErrorException.class).hasMessageContaining("Impossible to publish card : no i18n translation " +
                "for key=nonExistingI18nKeyForTitle (process=process1, processVersion=0, processInstanceId=cardWithNonExistingI18nKeyForTitle)");

        Card card2 = Card.builder().publisher("publisher_test").processVersion("0")
                .processInstanceId("cardWithNonExistingI18nKeyForSummary").severity(SeverityEnum.INFORMATION)
                .process("process1")
                .state("messageState")
                .title(new I18n("title",null))
                .summary(new I18n("nonExistingI18nKeyForSummary",null))
                .startDate(Instant.now())
                .build();

        Assertions.assertThatThrownBy(() -> {
            cardTranslationService.translate(card2);
        }).isInstanceOf(ApiErrorException.class).hasMessageContaining("Impossible to publish card : no i18n translation " +
                "for key=nonExistingI18nKeyForSummary (process=process1, processVersion=0, processInstanceId=cardWithNonExistingI18nKeyForSummary)");
    }
 
    @Test
    void translateCard(){
        HashMap<String, String> parameters = new HashMap<>();
        parameters.put("arg1", "with parameter");
        Card card = Card.builder().publisher("publisher_test").processVersion("0")
                .processInstanceId("cardWithExistingI18nKeys").severity(SeverityEnum.INFORMATION)
                .process("process1")
                .state("messageState")
                .title(new I18n("title",null))
                .summary(new I18n("summary",parameters))
                .startDate(Instant.now())
                .build();

        cardTranslationService.translate(card);
        assertThat(card.getTitleTranslated()).isEqualTo("Title translated");
        assertThat(card.getSummaryTranslated()).isEqualTo("Summary translated with parameter");
    }
}
