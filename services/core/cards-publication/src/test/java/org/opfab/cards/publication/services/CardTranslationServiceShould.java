/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.publication.services;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.cards.publication.model.I18nPublicationData;
import org.opfab.cards.publication.application.UnitTestApplication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.assertj.core.api.Assertions.assertThat;


@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UnitTestApplication.class)
@ActiveProfiles(profiles = {"native","test"})
@Slf4j
class CardTranslationServiceShould {

    @Autowired
    CardTranslationService cardTranslationService;

    @Test
    public void translateCardField(){
        I18nPublicationData i18nValue = I18nPublicationData.builder()
                .key("title")
                .build();

        String fieldTranslated = cardTranslationService.translateCardField("process1", "1", i18nValue);
        assertThat(fieldTranslated).isEqualTo("Title translated");
    }

    @Test
    public void translateCardFieldWithParameter(){
        I18nPublicationData i18nValue = I18nPublicationData.builder()
                .key("summary")
                .parameter("arg1", "with parameter")
                .build();

        String fieldTranslated = cardTranslationService.translateCardField("process1", "1", i18nValue);
        assertThat(fieldTranslated).isEqualTo("Summary translated with parameter");
    }

    @Test
    public void translateCardFieldForNonExistingKey(){
        I18nPublicationData i18nValue = I18nPublicationData.builder()
                .key("notExistingKey")
                .build();

        String fieldTranslated = cardTranslationService.translateCardField("process1", "1", i18nValue);
        assertThat(fieldTranslated).isEqualTo("notExistingKey");
    }
}
