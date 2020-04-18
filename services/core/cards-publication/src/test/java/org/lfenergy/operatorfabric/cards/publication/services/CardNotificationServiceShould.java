/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.publication.services;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.model.CardOperationTypeEnum;
import org.lfenergy.operatorfabric.cards.model.RecipientEnum;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.lfenergy.operatorfabric.cards.publication.CardPublicationApplication;
import org.lfenergy.operatorfabric.cards.publication.configuration.TestCardReceiver;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.model.I18nPublicationData;
import org.lfenergy.operatorfabric.cards.publication.model.RecipientPublicationData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

/**
 * <p></p>
 * Created on 06/08/18
 *
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = CardPublicationApplication.class)
@ActiveProfiles(profiles = {"native","test"})
@Slf4j
@Tag("end-to-end")
@Tag("amqp")
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
           .publisherVersion("0.0.1")
           .processId("PROCESS_1")
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

        cardNotificationService.notifyCards(Collections.singleton(newCard),CardOperationTypeEnum.ADD);
        await().pollDelay(1, TimeUnit.SECONDS).until(()->true);
        assertThat(testCardReceiver.getEricQueue().size()).isEqualTo(1);
        assertThat(testCardReceiver.getGroupQueue().size()).isEqualTo(1);
    }
}
