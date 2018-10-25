/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.publication.repositories;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.model.RecipientEnum;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.lfenergy.operatorfabric.cards.publication.Application;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.model.I18nPublicationData;
import org.lfenergy.operatorfabric.cards.publication.model.RecipientPublicationData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Instant;

/**
 * <p></p>
 * Created on 24/07/18
 *
 * @author davibind
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = Application.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles(profiles = {"native","test"})
//@Disabled
@Tag("end-to-end")
@Tag("mongo")
public class CardRepositoryShould {

    @Autowired
    private CardRepository repository;

    @AfterEach
    public void clean(){
        repository.deleteAll().subscribe();
    }

    @Test
    public void persistCard(){
        CardPublicationData card =
           CardPublicationData.builder()
              .processId("PROCESS")
              .publisher("PUBLISHER")
              .publisherVersion("0")
              .startDate(Instant.now().toEpochMilli())
              .severity(SeverityEnum.ALARM)
              .title(I18nPublicationData.builder().key("title").build())
              .summary(I18nPublicationData.builder().key("summary").build())
              .recipient(RecipientPublicationData.builder().type(RecipientEnum.DEADEND).build())
              .build();
        repository.save(card).subscribe();
        Mono<CardPublicationData> result = repository.findById("PUBLISHER_PROCESS");
        StepVerifier.create(result)
           .expectNextMatches(c->card.getId().equals(c.getId()));
    }

}