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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.cards.model.CardOperationTypeEnum;
import org.opfab.cards.model.RecipientEnum;
import org.opfab.cards.model.SeverityEnum;
import org.opfab.cards.publication.configuration.TestCardReceiver;
import org.opfab.cards.publication.model.CardOperationData;
import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.cards.publication.model.I18nPublicationData;
import org.opfab.cards.publication.model.RecipientPublicationData;
import org.opfab.cards.publication.application.UnitTestApplication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;


@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UnitTestApplication.class)
@ActiveProfiles(profiles = {"native","test"})
@Slf4j
class CardNotificationServiceShould {

    @Autowired
    CardNotificationService cardNotificationService;

    @Autowired
    TestCardReceiver testCardReceiver;

    @Autowired
    RecipientProcessor recipientProcessor;

    @BeforeEach
    @AfterEach
    public void clearData(){
        testCardReceiver.clear();
    }

    @Test
    public void transmitCards(){
        Instant start = Instant.now().plusSeconds(3600);
        CardPublicationData newCard = CardPublicationData.builder()
           .publisher("PUBLISHER_1")
           .processVersion("0.0.1")
           .processInstanceId("PROCESS_1")
           .severity(SeverityEnum.ALARM)
           .startDate(start)
           .title(I18nPublicationData.builder().key("title").build())
           .summary(I18nPublicationData.builder().key("summary").parameter("arg1","value1").build())
           .lttd(start.minusSeconds(600))
           .recipient(
              RecipientPublicationData.builder()
                 .type(RecipientEnum.UNION)
                 .recipient(
                    RecipientPublicationData.builder()
                       .type(RecipientEnum.USER)
                       .identity("graham")
                       .build()
                 )
                 .recipient(
                    RecipientPublicationData.builder()
                       .type(RecipientEnum.USER)
                       .identity("eric")
                       .build()
                 )
                 .recipient(
                    RecipientPublicationData.builder()
                    .type(RecipientEnum.GROUP)
                    .identity("mytso")
                    .build()
                 )
                 .recipient(
                    RecipientPublicationData.builder()
                       .type(RecipientEnum.GROUP)
                       .identity("admin")
                       .build()
                 )
                 .build())
           .build();
        recipientProcessor.processAll(newCard);

        cardNotificationService.notifyOneCard(newCard,CardOperationTypeEnum.ADD);
        await().pollDelay(1, TimeUnit.SECONDS).until(()->true);
        assertThat(testCardReceiver.getCardQueue().size()).isEqualTo(1);

        CardOperationData cardOperationData = testCardReceiver.getCardQueue().element();
        List<String> groupRecipientsIds = cardOperationData.getGroupRecipientsIds();
        assertThat(groupRecipientsIds.size()).isEqualTo(2);
        assertThat(groupRecipientsIds.contains("mytso")).isTrue();
        assertThat(groupRecipientsIds.contains("admin")).isTrue();

        List<String> userRecipientsIds = cardOperationData.getUserRecipientsIds();
        assertThat(userRecipientsIds.size()).isEqualTo(2);
        assertThat(userRecipientsIds.contains("graham")).isTrue();
        assertThat(userRecipientsIds.contains("eric")).isTrue();
    }
}
