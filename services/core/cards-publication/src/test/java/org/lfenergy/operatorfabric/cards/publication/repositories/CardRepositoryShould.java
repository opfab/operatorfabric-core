/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.publication.repositories;

import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.model.RecipientEnum;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.lfenergy.operatorfabric.cards.model.TimeSpanDisplayModeEnum;
import org.lfenergy.operatorfabric.cards.model.TitlePositionEnum;
import org.lfenergy.operatorfabric.cards.publication.CardPublicationApplication;
import org.lfenergy.operatorfabric.cards.publication.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import reactor.test.StepVerifier;

import java.time.Instant;
import java.util.function.Consumer;
import java.util.function.Predicate;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * <p></p>
 * Created on 24/07/18
 *
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = CardPublicationApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles(profiles = {"native", "test"})
//@Disabled
@Tag("end-to-end")
@Tag("mongo")
public class CardRepositoryShould {

    @Autowired
    private CardRepository repository;

    @AfterEach
    public void clean() {
        repository.deleteAll().subscribe();
    }

    @Test
    public void persistCard() {
        CardPublicationData card =
            CardPublicationData.builder()
                .processId("PROCESS")
                .publisher("PUBLISHER")
                .publisherVersion("0")
                .startDate(Instant.now())
                .severity(SeverityEnum.ALARM)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .recipient(RecipientPublicationData.builder()
                    .type(RecipientEnum.UNION)
                    .recipient(RecipientPublicationData.builder()
                        .type(RecipientEnum.GROUP)
                        .identity("group1")
                        .build())
                    .recipient(RecipientPublicationData.builder()
                        .type(RecipientEnum.GROUP)
                        .identity("group2")
                        .build())
                    .build())
                .detail(DetailPublicationData.builder()
                    .templateName("template")
                    .title(I18nPublicationData.builder()
                        .key("key")
                        .parameter("param1", "value1")
                        .build())
                    .titlePosition(TitlePositionEnum.UP)
                    .style("style")
                    .build())
                .timeSpan(
                        TimeSpanPublicationData.builder()
                                .start(Instant.ofEpochMilli(123l))
                                .build())
                .timeSpan(
                        TimeSpanPublicationData.builder()
                                .start(Instant.ofEpochMilli(123l))
                                .end(Instant.ofEpochMilli(456l))
                                .build())
                .timeSpan(
                        TimeSpanPublicationData.builder()
                                .start(Instant.ofEpochMilli(123l))
                                .end(Instant.ofEpochMilli(456l))
                                .display(TimeSpanDisplayModeEnum.BUBBLE)
                                .build())
                .build();
        card.prepare(Instant.now());
        StepVerifier.create(repository.save(card))
                .assertNext(computeCardAssertion(card))
                .expectComplete()
                .verify();

        StepVerifier.create(repository.findById("PUBLISHER_PROCESS"))
                .assertNext(c->{
                    computeCardAssertion(card).accept(c);
                    assertThat(c.getTimeSpans().get(0).getDisplay()).isEqualTo(TimeSpanDisplayModeEnum.BUBBLE);
                    assertThat(c.getTimeSpans().get(1).getDisplay()).isEqualTo(TimeSpanDisplayModeEnum.BUBBLE);
                    assertThat(c.getTimeSpans().get(2).getDisplay()).isEqualTo(TimeSpanDisplayModeEnum.BUBBLE);
                })
                .expectComplete()
                .verify();
    }

    @NotNull
    private Predicate<CardPublicationData> computeCardPredicate(CardPublicationData card) {
        Predicate<CardPublicationData> predicate = c -> card.getId().equals(c.getId());
        predicate = predicate.and(c -> c.getDetails().size() == 1);
        predicate = predicate.and(c -> c.getDetails().get(0).getTitlePosition() == TitlePositionEnum.UP);

        return predicate;
    }

    @NotNull
    private Consumer<CardPublicationData> computeCardAssertion(CardPublicationData card) {
        return c->{
            assertThat(c.getId()).isEqualTo(card.getId());
            assertThat(c.getDetails().size()).isEqualTo(1);
            assertThat(c.getDetails().get(0).getTitlePosition()).isEqualTo(TitlePositionEnum.UP);

        };
    }

}
