package org.lfenergy.operatorfabric.cards.consultation.repositories;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.consultation.TestUtilities;
import org.lfenergy.operatorfabric.cards.consultation.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.cards.consultation.model.*;
import org.lfenergy.operatorfabric.cards.model.*;
import org.lfenergy.operatorfabric.utilities.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import reactor.test.StepVerifier;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.function.Predicate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.lfenergy.operatorfabric.cards.consultation.TestUtilities.createSimpleCard;
import static org.lfenergy.operatorfabric.cards.consultation.TestUtilities.prepareCard;

/**
 * <p></p>
 * Created on 24/07/18
 *
 * @author David Binder
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = IntegrationTestApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles(profiles = {"native", "test"})
//@Disabled
@Tag("end-to-end")
@Tag("mongo")
@Slf4j
public class CardRepositoryShould {

    public static final String LOGIN = "rte-operator";
    private static Instant now = Instant.now();
    private static Instant nowPlusOne = now.plus(1, ChronoUnit.HOURS);
    private static Instant nowPlusTwo = now.plus(2, ChronoUnit.HOURS);
    private static Instant nowPlusThree = now.plus(3, ChronoUnit.HOURS);
    private static Instant nowMinusOne = now.minus(1, ChronoUnit.HOURS);
    private static Instant nowMinusTwo = now.minus(2, ChronoUnit.HOURS);
    private static Instant nowMinusThree = now.minus(3, ChronoUnit.HOURS);

    @Autowired
    private CardRepository repository;

    @Autowired
    private ObjectMapper mapper;

    @AfterEach
    public void clean() {
        repository.deleteAll().subscribe();
    }

    @BeforeEach
    private void initCardData() {
        int processNo = 0;
//create past cards
        persistCard(createSimpleCard(processNo++, nowMinusThree, nowMinusTwo, nowMinusOne, LOGIN,"rte","operator"));
        persistCard(createSimpleCard(processNo++, nowMinusThree, nowMinusTwo, nowMinusOne, LOGIN,"rte","operator"));
        persistCard(createSimpleCard(processNo++, nowMinusThree, nowMinusOne, now, LOGIN,"rte","operator"));
        //create future cards
        persistCard(createSimpleCard(processNo++, nowMinusThree, now, nowPlusOne, LOGIN,"rte","operator"));
        persistCard(createSimpleCard(processNo++, nowMinusThree, nowPlusOne, nowPlusTwo, LOGIN,"rte","operator"));
        persistCard(createSimpleCard(processNo++, nowMinusThree, nowPlusTwo, nowPlusThree, LOGIN,"rte","operator"));

        //card starts in past and ends in future
        persistCard(createSimpleCard(processNo++, nowMinusThree, nowMinusThree, nowPlusThree, LOGIN,"rte","operator"));

        //card starts in past and never ends
        persistCard(createSimpleCard(processNo++, nowMinusThree, nowMinusThree, null, LOGIN,"rte","operator"));

        //card starts in future and nerver ends
        persistCard(createSimpleCard(processNo++, nowMinusThree, nowPlusThree, null, LOGIN,"rte","operator"));

        //create later published cards in past
        //this one overides first
        persistCard(createSimpleCard(1, nowPlusOne, nowMinusTwo, nowMinusOne, LOGIN,"rte","operator"));
        persistCard(createSimpleCard(processNo++, nowPlusOne, nowMinusTwo, nowMinusOne, LOGIN,"rte","operator"));
        //create later published cards in future
        // this one overrides third
        persistCard(createSimpleCard(3, nowPlusOne, nowPlusOne, nowPlusTwo, LOGIN,"rte","operator"));
        persistCard(createSimpleCard(processNo++, nowPlusOne, nowPlusTwo, nowPlusThree, LOGIN,"rte","operator"));
    }

    private void persistCard(CardConsultationData simpleCard) {
        StepVerifier.create(repository.save(simpleCard))
                .expectNextCount(1)
                .expectComplete()
                .verify();
    }

    @Test
    public void persistCard() {
        CardConsultationData card =
                CardConsultationData.builder()
                        .processId("PROCESS")
                        .publisher("PUBLISHER")
                        .publisherVersion("0")
                        .startDate(Instant.now().toEpochMilli())
                        .severity(SeverityEnum.ALARM)
                        .title(I18nConsultationData.builder().key("title").build())
                        .summary(I18nConsultationData.builder().key("summary").build())
                        .recipient(RecipientConsultationData.builder()
                                .type(RecipientEnum.UNION)
                                .recipient(RecipientConsultationData.builder()
                                        .type(RecipientEnum.GROUP)
                                        .identity("group1")
                                        .build())
                                .recipient(RecipientConsultationData.builder()
                                        .type(RecipientEnum.GROUP)
                                        .identity("group2")
                                        .build())
                                .build())
                        .detail(DetailConsultationData.builder()
                                .templateName("template")
                                .title(I18nConsultationData.builder()
                                        .key("key")
                                        .parameter("param1", "value1")
                                        .build())
                                .titlePosition(TitlePositionEnum.UP)
                                .style("style")
                                .build())
                        .action("action1", ActionConsultationData.builder()
                                .type(ActionEnum.URI)
                                .label(I18nConsultationData.builder().key("actione1Key").build())
                                .input(InputConsultationData.builder()
                                        .type(InputEnum.SWITCH_LIST)
                                        .label(I18nConsultationData.builder().key("paramKey").build())
                                        .name("param")
                                        .value(ParameterListItemConsultationData.builder().value("v1").label(I18nConsultationData.builder().key("v1Key").build()).build())
                                        .value(ParameterListItemConsultationData.builder().value("v2").label(I18nConsultationData.builder().key("v2Key").build()).build())
                                        .selectedValue("v1")
                                        .unSelectedValue("v2")
                                        .build())
                                .build())
                        .build();
        prepareCard(card, Instant.now().toEpochMilli());
        StepVerifier.create(repository.save(card))
                .expectNextMatches(computeCardPredicate(card))
                .expectComplete()
                .verify();

        StepVerifier.create(repository.findById("PUBLISHER_PROCESS"))
                .expectNextMatches(computeCardPredicate(card))
                .expectComplete()
                .verify();
    }

    @Test
    public void fetchPast() {
        log.info(String.format("Fetching past before now(%s), published after now(%s)", TestUtilities.format(now), TestUtilities.format(now)));
        StepVerifier.create(repository.findPastOnly(now.toEpochMilli(),now.toEpochMilli(),"rte-operator","rte","operator")
                .doOnNext(TestUtilities::logCardOperation))
            .assertNext(op-> {
                    assertThat(op.getCards().size()).isEqualTo(1);
                    assertThat(op.getPublishDate()).isEqualTo(nowMinusThree.toEpochMilli());
                    assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS0");
                    assertThat(op.getCards().get(0).getPublisher()).isEqualTo("PUBLISHER");
                    assertThat(op.getCards().get(0).getPublisherVersion()).isEqualTo("0");
            })
            .expectComplete()
            .verify();

        log.info(String.format("Fetching past before now plus three hours(%s), published after now(%s)", TestUtilities.format(nowPlusThree), TestUtilities.format(now)));
        StepVerifier.create(repository.findPastOnly(now.toEpochMilli(),nowPlusThree.toEpochMilli(),"rte-operator","rte","operator")
        .doOnNext(TestUtilities::logCardOperation))
                .assertNext(op-> {
                    assertThat(op.getCards().size()).isEqualTo(3);
                    assertThat(op.getPublishDate()).isEqualTo(nowMinusThree.toEpochMilli());
                    assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS0");
                    assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS2");
                    assertThat(op.getCards().get(2).getId()).isEqualTo("PUBLISHER_PROCESS4");
                })
                .expectComplete()
                .verify();
        log.info(String.format("Fetching past before now (%s), published after now plus three hours(%s)", TestUtilities.format(now), TestUtilities.format(nowPlusThree)));
        StepVerifier.create(repository.findPastOnly(nowPlusThree.toEpochMilli(),now.toEpochMilli(),"rte-operator","rte","operator")
                .doOnNext(TestUtilities::logCardOperation))
                .assertNext(op-> {
                    assertThat(op.getPublishDate()).isEqualTo(nowMinusThree.toEpochMilli());
                    assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS0");
                })
                .assertNext(op-> {
                    assertThat(op.getCards().size()).isEqualTo(2);
                    assertThat(op.getPublishDate()).isEqualTo(nowPlusOne.toEpochMilli());
                    assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS1");
                    assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS9");
                })
                .expectComplete()
                .verify();
    }

    @Test
    public void fetchPastJSON() {
        log.info(String.format("Fetching past before now (%s), published after now plus three hours(%s)", TestUtilities.format(now), TestUtilities.format(nowPlusThree)));
        StepVerifier.create(repository.findPastOnlyJSON(nowPlusThree.toEpochMilli(),now.toEpochMilli(),"rte-operator","rte","operator")
                .map(s-> TestUtilities.readCardOperation(mapper, s))
                .doOnNext(TestUtilities::logCardOperation))
                .assertNext(op-> {
                    assertThat(op.getPublishDate()).isEqualTo(nowMinusThree.toEpochMilli());
                    assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS0");
                })
                .assertNext(op-> {
                    assertThat(op.getCards().size()).isEqualTo(2);
                    assertThat(op.getPublishDate()).isEqualTo(nowPlusOne.toEpochMilli());
                    assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS1");
                    assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS9");
                })
                .expectComplete()
                .verify();
    }

    @Test
    public void fetchFuture() {
        log.info(String.format("Fetching future from now(%s), published after now(%s)", TestUtilities.format(now), TestUtilities.format(now)));
        StepVerifier.create(repository.findFutureOnly(now.toEpochMilli(),now.toEpochMilli(),"rte-operator","rte","operator")
                .doOnNext(TestUtilities::logCardOperation))
                .assertNext(op-> {
                    assertThat(op.getCards().size()).isEqualTo(3);
                    assertThat(op.getPublishDate()).isEqualTo(nowMinusThree.toEpochMilli());
                    assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS4");
                    assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS5");
                    assertThat(op.getCards().get(2).getId()).isEqualTo("PUBLISHER_PROCESS8");
                })
            .expectComplete()
            .verify();
        log.info(String.format("Fetching future from now minus two hours(%s), published after now(%s)", TestUtilities.format(nowMinusTwo), TestUtilities.format(now)));
        StepVerifier.create(repository.findFutureOnly(now.toEpochMilli(), nowMinusTwo.toEpochMilli(),"rte-operator","rte","operator")
                .doOnNext(TestUtilities::logCardOperation) )
                .assertNext(op-> {
                    assertThat(op.getCards().size()).isEqualTo(4);
                    assertThat(op.getPublishDate()).isEqualTo(nowMinusThree.toEpochMilli());
                    assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS2");
                    assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS4");
                    assertThat(op.getCards().get(2).getId()).isEqualTo("PUBLISHER_PROCESS5");
                    assertThat(op.getCards().get(3).getId()).isEqualTo("PUBLISHER_PROCESS8");
                })
            .expectComplete()
            .verify();
        log.info(String.format("Fetching future from now minus two hours(%s), published after now plus three hours(%s)", TestUtilities.format(nowMinusTwo), TestUtilities.format(nowPlusThree)));
        StepVerifier.create(repository.findFutureOnly(nowPlusThree.toEpochMilli(),nowMinusTwo.toEpochMilli(),"rte-operator","rte","operator")
                .doOnNext(TestUtilities::logCardOperation) )
                .assertNext(op-> {
                    assertThat(op.getCards().size()).isEqualTo(4);
                    assertThat(op.getPublishDate()).isEqualTo(nowMinusThree.toEpochMilli());
                    assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS2");
                    assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS4");
                    assertThat(op.getCards().get(2).getId()).isEqualTo("PUBLISHER_PROCESS5");
                    assertThat(op.getCards().get(3).getId()).isEqualTo("PUBLISHER_PROCESS8");
                })
                .assertNext(op-> {
                    assertThat(op.getCards().size()).isEqualTo(2);
                    assertThat(op.getPublishDate()).isEqualTo(nowPlusOne.toEpochMilli());
                    assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS3");
                    assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS10");
                })
            .expectComplete()
            .verify();
    }

    @Test
    public void fetchFutureJSON() {
        log.info(String.format("Fetching future from now minus two hours(%s), published after now plus three hours(%s)", TestUtilities.format(nowMinusTwo), TestUtilities.format(nowPlusThree)));
        StepVerifier.create(repository.findFutureOnlyJSON(nowPlusThree.toEpochMilli(),nowMinusTwo.toEpochMilli(),"rte-operator","rte","operator")
                .map(s->TestUtilities.readCardOperation(mapper, s))
                .doOnNext(TestUtilities::logCardOperation)
        )
                .assertNext(op-> {
                    assertThat(op.getCards().size()).isEqualTo(4);
                    assertThat(op.getPublishDate()).isEqualTo(nowMinusThree.toEpochMilli());
                    assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS2");
                    assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS4");
                    assertThat(op.getCards().get(2).getId()).isEqualTo("PUBLISHER_PROCESS5");
                    assertThat(op.getCards().get(3).getId()).isEqualTo("PUBLISHER_PROCESS8");
                })
                .assertNext(op-> {
                    assertThat(op.getCards().size()).isEqualTo(2);
                    assertThat(op.getPublishDate()).isEqualTo(nowPlusOne.toEpochMilli());
                    assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS3");
                    assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS10");
                })
                .expectComplete()
                .verify();
    }

    @Test
    public void fetchUrgent() {
        log.info(String.format("Fetching urgent from now minus one hours(%s) and now plus one hours(%s), published after now (%s)", TestUtilities.format(nowMinusOne), TestUtilities.format(nowPlusOne), TestUtilities.format(now)));
        StepVerifier.create(repository.findUrgent(now.toEpochMilli(),nowMinusOne.toEpochMilli(),nowPlusOne.toEpochMilli(),"rte-operator","rte","operator")
                .doOnNext(TestUtilities::logCardOperation) )
                .assertNext(op-> {
                    assertThat(op.getCards().size()).isEqualTo(5);
                    assertThat(op.getPublishDate()).isEqualTo(nowMinusThree.toEpochMilli());
                    assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS6");
                    assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS7");
                    assertThat(op.getCards().get(2).getId()).isEqualTo("PUBLISHER_PROCESS0");
                    assertThat(op.getCards().get(3).getId()).isEqualTo("PUBLISHER_PROCESS2");
                    assertThat(op.getCards().get(4).getId()).isEqualTo("PUBLISHER_PROCESS4");
                })
            .expectComplete()
            .verify();
    }

    @Test
    public void fetchUrgentJSON() {
        log.info(String.format("Fetching urgent from now minus one hours(%s) and now plus one hours(%s), published after now (%s)", TestUtilities.format(nowMinusOne), TestUtilities.format(nowPlusOne), TestUtilities.format(now)));
        StepVerifier.create(repository.findUrgentJSON(now.toEpochMilli(),nowMinusOne.toEpochMilli(),nowPlusOne.toEpochMilli(),"rte-operator","rte","operator")
                .map(s->TestUtilities.readCardOperation(mapper, s))
                .doOnNext(TestUtilities::logCardOperation) )
                .assertNext(op-> {
                    assertThat(op.getCards().size()).isEqualTo(5);
                    assertThat(op.getPublishDate()).isEqualTo(nowMinusThree.toEpochMilli());
                    assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS6");
                    assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS7");
                    assertThat(op.getCards().get(2).getId()).isEqualTo("PUBLISHER_PROCESS0");
                    assertThat(op.getCards().get(3).getId()).isEqualTo("PUBLISHER_PROCESS2");
                    assertThat(op.getCards().get(4).getId()).isEqualTo("PUBLISHER_PROCESS4");
                })
                .expectComplete()
                .verify();
    }

    @NotNull
    private Predicate<CardConsultationData> computeCardPredicate(CardConsultationData card) {
        Predicate<CardConsultationData> predicate = c -> card.getId().equals(c.getId());
        predicate = predicate.and(c -> c.getDetails().size() == 1);
        predicate = predicate.and(c -> c.getDetails().get(0).getTitlePosition() == TitlePositionEnum.UP);
        predicate = predicate.and(c -> "PUBLISHER".equals(c.getPublisher()));
        return predicate;
    }


}