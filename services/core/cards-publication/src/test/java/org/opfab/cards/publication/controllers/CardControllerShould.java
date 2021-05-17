/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.controllers;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.cards.publication.application.UnitTestApplication;
import org.opfab.cards.publication.repositories.CardRepositoryForTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import lombok.extern.slf4j.Slf4j;

import org.springframework.test.context.web.WebAppConfiguration;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UnitTestApplication.class)
@ActiveProfiles("test")
@WebAppConfiguration
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Slf4j
class CardControllerShould {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private CardRepositoryForTest cardRepository;

    @BeforeAll
    private void setup() throws Exception {
        this.mockMvc = webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @AfterAll
    void clean() {
        cardRepository.deleteAll();
    }

    private String getCard() {
        return "{" + "\"publisher\" : \"api_test\"," + "\"processVersion\" : \"1\"," + "\"process\"  :\"api_test\","
                + "\"processInstanceId\" : \"process1\"," + "\"state\": \"messageState\","
                + "\"groupRecipients\": [\"Dispatcher\"]," + "\"severity\" : \"INFORMATION\","
                + "\"startDate\" : 1553186770681," + "\"summary\" : {\"key\" : \"defaultProcess.summary\"},"
                + "\"title\" : {\"key\" : \"defaultProcess.title\"}," + "\"data\" : {\"message\":\"a message\"}" + "}";
    }


    @Test
    void postCardWithDepracatedEndPoint() throws Exception {

        mockMvc.perform(post("/cards").contentType(MediaType.APPLICATION_JSON).content(getCard()))
                .andExpect(status().isCreated());
    }

    @Test
    void postCard() throws Exception {

        mockMvc.perform(post("/cards").contentType(MediaType.APPLICATION_JSON).content(getCard()))
                .andExpect(status().isCreated());
    }

    @Test
    void deleteCard() throws Exception {

        mockMvc.perform(post("/cards").contentType(MediaType.APPLICATION_JSON).content(getCard()));
        mockMvc.perform(delete("/cards/api_test.process1"))
                .andExpect(status().isOk());
        Assertions.assertThat(cardRepository.count()).isEqualTo(0);
    }


    @Test
    void deleteAnNonexistingCard() throws Exception {

        mockMvc.perform(post("/cards").contentType(MediaType.APPLICATION_JSON).content(getCard()));
        mockMvc.perform(delete("/cards/api_test.process2"))
                .andExpect(status().isNotFound());
        Assertions.assertThat(cardRepository.count()).isEqualTo(1);
    }


    @Test
    void deleteAUserCardWithNoAuthentication() throws Exception {

        mockMvc.perform(post("/cards").contentType(MediaType.APPLICATION_JSON).content(getCard()));
        mockMvc.perform(delete("/cards/userCard/api_test.process1"))
                .andExpect(status().isForbidden());
        Assertions.assertThat(cardRepository.count()).isEqualTo(1);
    }

}
