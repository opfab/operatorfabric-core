/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.services;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.Application;
import org.lfenergy.operatorfabric.cards.config.TestCardReceiver;
import org.lfenergy.operatorfabric.cards.model.*;
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
 * @author davibind
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = Application.class)
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
        CardData newCard = CardData.builder()
           .publisher("PUBLISHER_1")
           .publisherVersion("0.0.1")
           .processId("PROCESS_1")
           .severity(SeverityEnum.ALARM)
           .startDate(start.toEpochMilli())
           .title(I18nData.builder().key("title").build())
           .summary(I18nData.builder().key("summary").parameter("arg1","value1").build())
           .lttd(start.minusSeconds(600).toEpochMilli())
           .recipient(
              RecipientData.builder()
                 .type(RecipientEnum.UNION)
                 .recipient(
                    RecipientData.builder()
                       .type(RecipientEnum.USER)
                       .identity("graham")
                       .build()
                 )
                 .recipient(
                    RecipientData.builder()
                       .type(RecipientEnum.USER)
                       .identity("eric")
                       .build()
                 )
                 .recipient(
                    RecipientData.builder()
                    .type(RecipientEnum.GROUP)
                    .identity("mytso")
                    .build()
                 )
                 .recipient(
                    RecipientData.builder()
                       .type(RecipientEnum.GROUP)
                       .identity("admin")
                       .build()
                 )
                 .build())
           .build();
        recipientProcessor.processAll(newCard);

        cardNotificationService.notifyCards(Collections.singleton(newCard),CardOperationTypeEnum.ADD);
        await().pollDelay(5, TimeUnit.SECONDS).until(()->true);
        assertThat(testCardReceiver.getEricQueue().size()).isEqualTo(1);
        assertThat(testCardReceiver.getAdminQueue().size()).isEqualTo(1);
        assertThat(testCardReceiver.getTsoQueue().size()).isEqualTo(1);
    }
}