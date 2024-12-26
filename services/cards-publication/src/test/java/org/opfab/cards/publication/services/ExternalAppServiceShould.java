/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * Copyright (c) 2021-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.cards.publication.services;


import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.cards.publication.configuration.ExternalRecipients;
import org.opfab.cards.publication.kafka.producer.ResponseCardProducer;
import org.opfab.cards.publication.model.Card;
import org.opfab.cards.publication.model.I18n;
import org.opfab.cards.publication.model.SeverityEnum;
import org.opfab.cards.publication.model.TimeSpan;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;

import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ExternalAppServiceShould {

    @Mock
    private ResponseCardProducer responseCardProducer;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private ObjectMapper mapper;

    @InjectMocks
    private ExternalAppService externalAppService;

    private final String externalRecipientKafka = "kafka_recipient";
    private final String externalRecipientHttp = "http_recipient";
    private ExternalRecipients externalRecipients;

    @BeforeAll
    void setup() {
        externalRecipients = new ExternalRecipients();
        List<ExternalRecipients.ExternalRecipient> recipients = new ArrayList<>();
        ExternalRecipients.ExternalRecipient kafka = new ExternalRecipients.ExternalRecipient();
        kafka.setId(externalRecipientKafka);
        kafka.setUrl("kafka:");

        ExternalRecipients.ExternalRecipient http = new ExternalRecipients.ExternalRecipient();
        http.setId(externalRecipientHttp);
        http.setUrl("http://");

        recipients.add(kafka);
        recipients.add(http);
        externalRecipients.setRecipients(recipients);
    }

    @Test
    void sendCardToExternalApplicationKafka() {
        Card card = createCardPublicationData(externalRecipientKafka);
        ReflectionTestUtils.setField(externalAppService, "externalRecipients", externalRecipients);
        externalAppService.sendCardToExternalApplication(card, Optional.empty());
        verify (responseCardProducer).send(card);
    }

    @Test
    void sendCardToExternalApplicationHttp() {
        Card card = createCardPublicationData(externalRecipientHttp);
        ReflectionTestUtils.setField(externalAppService, "externalRecipients", externalRecipients);
        externalAppService.sendCardToExternalApplication(card, Optional.empty());
        verify (restTemplate).postForObject(anyString(), any(), any());
    }

    private Card createCardPublicationData( String externalRecipients ) {
        return  Card.builder().publisher("PUBLISHER_1").processVersion("O")
                .processInstanceId("PROCESS_1").severity(SeverityEnum.ALARM)
                .title(new I18n("title",null))
                .summary(new I18n("summary",null))
                .startDate(Instant.now())
                .timeSpan(new TimeSpan(Instant.ofEpochMilli(123l), null))
                .process("process1")
                .state("state1")
                .externalRecipients(Arrays.asList(externalRecipients))
                .build();
    }
}
