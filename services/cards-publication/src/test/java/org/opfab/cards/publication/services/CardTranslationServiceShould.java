/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.publication.services;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.opfab.cards.model.SeverityEnum;
import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.cards.publication.model.I18nPublicationData;
import org.opfab.cards.publication.mocks.I18NRepositoryMock;
import org.opfab.springtools.error.model.ApiErrorException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CardTranslationServiceShould {
  
    CardTranslationService cardTranslationService;

    I18NRepositoryMock i18nRepositoryMock = new I18NRepositoryMock();

    @BeforeEach
    void setUp() {
        cardTranslationService = new CardTranslationService(i18nRepositoryMock);

        ObjectMapper mapper = new ObjectMapper();
        ObjectNode node = mapper.createObjectNode();

        node.put("title", "Title translated");
        node.put("summary", "Summary translated {{arg1}}");
        
        i18nRepositoryMock.setJsonNode(node);
    }
    


    @Test
    void translateCardField(){
        I18nPublicationData i18nValue = I18nPublicationData.builder()
                .key("title")
                .build();

        String fieldTranslated = cardTranslationService.translateCardField("process1", "1", i18nValue);
        assertThat(fieldTranslated).isEqualTo("Title translated");
    }

    @Test
    void translateCardFieldWithParameter(){
        I18nPublicationData i18nValue = I18nPublicationData.builder()
                .key("summary")
                .parameter("arg1", "with parameter")
                .build();

        String fieldTranslated = cardTranslationService.translateCardField("process1", "1", i18nValue);
        assertThat(fieldTranslated).isEqualTo("Summary translated with parameter");
    }

    @Test
    void translateCardFieldForNonExistingKey(){
        I18nPublicationData i18nValue = I18nPublicationData.builder()
                .key("notExistingKey")
                .build();

        String fieldTranslated = cardTranslationService.translateCardField("process1", "1", i18nValue);
        assertThat(fieldTranslated).isEqualTo("notExistingKey");
    }

    @Test
    void translateCardWithNonExistingI18nFile(){
        i18nRepositoryMock.setJsonNode(null);
        CardPublicationData card = CardPublicationData.builder().publisher("publisher_test").processVersion("1")
                .processInstanceId("cardWithProcessWithNonExistingI18nFile").severity(SeverityEnum.INFORMATION)
                .process("processWithNonExistingI18nFile")
                .state("messageState")
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .build();

        Assertions.assertThatThrownBy(() -> {
            cardTranslationService.translate(card);
        }).isInstanceOf(ApiErrorException.class).hasMessageContaining("Impossible to publish card : no i18n file for " +
                "process=processWithNonExistingI18nFile, processVersion=1 (processInstanceId=cardWithProcessWithNonExistingI18nFile)");

    }



    @Test
    void translateCardWithNonExistingI18nKey(){
        CardPublicationData card1 = CardPublicationData.builder().publisher("publisher_test").processVersion("0")
                .processInstanceId("cardWithNonExistingI18nKeyForTitle").severity(SeverityEnum.INFORMATION)
                .process("process1")
                .state("messageState")
                .title(I18nPublicationData.builder().key("nonExistingI18nKeyForTitle").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .build();

        Assertions.assertThatThrownBy(() -> {
            cardTranslationService.translate(card1);
        }).isInstanceOf(ApiErrorException.class).hasMessageContaining("Impossible to publish card : no i18n translation " +
                "for key=nonExistingI18nKeyForTitle (process=process1, processVersion=0, processInstanceId=cardWithNonExistingI18nKeyForTitle)");

        CardPublicationData card2 = CardPublicationData.builder().publisher("publisher_test").processVersion("0")
                .processInstanceId("cardWithNonExistingI18nKeyForSummary").severity(SeverityEnum.INFORMATION)
                .process("process1")
                .state("messageState")
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("nonExistingI18nKeyForSummary").build())
                .startDate(Instant.now())
                .build();

        Assertions.assertThatThrownBy(() -> {
            cardTranslationService.translate(card2);
        }).isInstanceOf(ApiErrorException.class).hasMessageContaining("Impossible to publish card : no i18n translation " +
                "for key=nonExistingI18nKeyForSummary (process=process1, processVersion=0, processInstanceId=cardWithNonExistingI18nKeyForSummary)");
    }
 
    @Test
    void translateCard(){
        CardPublicationData card = CardPublicationData.builder().publisher("publisher_test").processVersion("0")
                .processInstanceId("cardWithExistingI18nKeys").severity(SeverityEnum.INFORMATION)
                .process("process1")
                .state("messageState")
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").parameter("arg1", "with parameter").build())
                .startDate(Instant.now())
                .build();

        cardTranslationService.translate(card);
        assertThat(card.getTitleTranslated()).isEqualTo("Title translated");
        assertThat(card.getSummaryTranslated()).isEqualTo("Summary translated with parameter");
    }
}
