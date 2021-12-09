/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.publication.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.cards.publication.application.UnitTestApplication;
import org.opfab.cards.publication.configuration.json.JacksonConfig;
import org.opfab.cards.publication.model.CardPublicationData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes={UnitTestApplication.class, JacksonConfig.class})
@ActiveProfiles(profiles = {"native","test"})
@Slf4j
public class ObjectMapperShould {

    @Autowired
    private ObjectMapper mapper;

    @Test
    public void readCard() throws IOException {
        String stringCard = "{" +
                "\"publishDate\": 123,"+
                "\"data\": {"+
                  "\"int\": 123,"+
                  "\"string\": \"test\","+
                  "\"object\": {"+
                    "\"int\": 456,"+
                    "\"string\": \"test2\""+
                  "}"+
                "}"+
           "}";
        CardPublicationData card = mapper.readValue(stringCard, CardPublicationData.class);
        assertThat(card.getData()).isNotNull();
        assertThat(((Map) card.getData()).get("int")).isEqualTo(123);
        assertThat(((Map) card.getData()).get("string")).isEqualTo("test");
        assertThat((Map) ((Map) card.getData()).get("object")).isNotNull();
        assertThat(((Map) ((Map) card.getData()).get("object")).get("int")).isEqualTo(456);
        assertThat(((Map) ((Map) card.getData()).get("object")).get("string")).isEqualTo("test2");
        assertThat(card.getPublishDate().toEpochMilli()).isEqualTo(123);
    }
}
