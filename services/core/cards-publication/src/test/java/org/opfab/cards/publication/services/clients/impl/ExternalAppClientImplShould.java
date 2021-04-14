/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.cards.publication.services.clients.impl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.cards.model.SeverityEnum;
import org.opfab.cards.publication.kafka.producer.ResponseCardProducer;
import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.cards.publication.model.I18nPublicationData;
import org.opfab.cards.publication.model.RecipientPublicationData;
import org.opfab.cards.publication.model.TimeSpanPublicationData;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static org.opfab.cards.model.RecipientEnum.DEADEND;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = {"native", "test"})
class ExternalAppClientImplShould {

    @Mock
    private ResponseCardProducer responseCardProducer;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private ExternalAppClientImpl cut;

    private final String externalRecipientKafka = "kafka_recipient";
    private final String externalRecipientHttp = "http_recipient";
    private final Map<String, String> externalRecipientsMapping = new HashMap<String, String>() {
        {
            put (externalRecipientKafka, "kafka:");
            put (externalRecipientHttp, "http://");
        }
    };

    @Test
    void sendCardToExternalApplicationKafka() {
        CardPublicationData card = createCardPublicationData(externalRecipientKafka);
        ReflectionTestUtils.setField(cut, "externalRecipients", externalRecipientsMapping);
        cut.sendCardToExternalApplication(card);
        verify (responseCardProducer).send(card);
    }

    @Test
    void sendCardToExternalApplicationHttp() {
        CardPublicationData card = createCardPublicationData(externalRecipientHttp);
        ReflectionTestUtils.setField(cut, "externalRecipients", externalRecipientsMapping);
        cut.sendCardToExternalApplication(card);
        verify (restTemplate).postForObject(anyString(), any(), any());
    }

    private CardPublicationData createCardPublicationData( String externalRecipients ) {
        return  CardPublicationData.builder().publisher("PUBLISHER_1").processVersion("O")
                .processInstanceId("PROCESS_1").severity(SeverityEnum.ALARM)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                .timeSpan(TimeSpanPublicationData.builder()
                        .start(Instant.ofEpochMilli(123l)).build())
                .process("process1")
                .state("state1")
                .externalRecipients(Arrays.asList(externalRecipients))
                .build();
    }
}
