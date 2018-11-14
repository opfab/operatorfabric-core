package org.lfenergy.operatorfabric.cards.consultation.repositories;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.consultation.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.cards.consultation.model.*;
import org.lfenergy.operatorfabric.cards.consultation.model.CardOperation;
import org.lfenergy.operatorfabric.cards.consultation.model.LightCard;
import org.lfenergy.operatorfabric.cards.model.*;
import org.lfenergy.operatorfabric.utilities.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import reactor.test.StepVerifier;

import java.io.IOException;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import java.util.function.Predicate;

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

    private Instant now = Instant.now();
    private Instant nowPlusOne = now.plus(1, ChronoUnit.HOURS);
    private Instant nowPlusTwo = now.plus(2, ChronoUnit.HOURS);
    private Instant nowPlusThree = now.plus(3, ChronoUnit.HOURS);
    private Instant nowMinusOne = now.minus(1, ChronoUnit.HOURS);
    private Instant nowMinusTwo = now.minus(2, ChronoUnit.HOURS);
    private Instant nowMinusThree = now.minus(3, ChronoUnit.HOURS);

    private static DateTimeFormatter ZONED_FORMATTER = DateTimeUtil.OUT_DATETIME_FORMAT.withZone(ZoneOffset.UTC);

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
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowMinusTwo, nowMinusOne)))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowMinusTwo, nowMinusOne)))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowMinusOne, now)))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        //create future cards
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, now, nowPlusOne)))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowPlusOne, nowPlusTwo)))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowPlusTwo, nowPlusThree)))
                .expectNextCount(1)
                .expectComplete()
                .verify();

        //card starts in past and ends in future
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowMinusThree, nowPlusThree)))
                .expectNextCount(1)
                .expectComplete()
                .verify();

        //card starts in past and never ends
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowMinusThree, null)))
                .expectNextCount(1)
                .expectComplete()
                .verify();

        //card starts in future and nerver ends
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowPlusThree, null)))
                .expectNextCount(1)
                .expectComplete()
                .verify();

        //create later published cards in past
        //this one overides first
        StepVerifier.create(repository.save(createSimpleCard(1, nowPlusOne, nowMinusTwo, nowMinusOne)))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowPlusOne, nowMinusTwo, nowMinusOne)))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        //create later published cards in future
        // this one overrides third
        StepVerifier.create(repository.save(createSimpleCard(3, nowPlusOne, nowPlusOne, nowPlusTwo)))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowPlusOne, nowPlusTwo, nowPlusThree)))
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
        prepare(card, Instant.now().toEpochMilli());
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
        log.info(String.format("Fetching past before now(%s), published after now(%s)", format(now), format(now)));
        StepVerifier.create(repository.findPastOnly(now.toEpochMilli(),now.toEpochMilli())
                .doOnNext(this::logCardOperation))
            .assertNext(op-> {
                    Assertions.assertThat(op.getCards().size()).isEqualTo(1);
                    Assertions.assertThat(op.getPublishDate()).isEqualTo(nowMinusThree.toEpochMilli());
                    Assertions.assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS0");
            })
            .expectComplete()
            .verify();

        log.info(String.format("Fetching past before now plus three hours(%s), published after now(%s)", format(nowPlusThree), format(now)));
        StepVerifier.create(repository.findPastOnly(now.toEpochMilli(),nowPlusThree.toEpochMilli())
        .doOnNext(this::logCardOperation))
                .assertNext(op-> {
                    Assertions.assertThat(op.getCards().size()).isEqualTo(3);
                    Assertions.assertThat(op.getPublishDate()).isEqualTo(nowMinusThree.toEpochMilli());
                    Assertions.assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS0");
                    Assertions.assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS2");
                    Assertions.assertThat(op.getCards().get(2).getId()).isEqualTo("PUBLISHER_PROCESS4");
                })
                .expectComplete()
                .verify();
        log.info(String.format("Fetching past before now (%s), published after now plus three hours(%s)", format(now), format(nowPlusThree)));
        StepVerifier.create(repository.findPastOnly(nowPlusThree.toEpochMilli(),now.toEpochMilli())
                .doOnNext(this::logCardOperation))
                .assertNext(op-> {
                    Assertions.assertThat(op.getPublishDate()).isEqualTo(nowMinusThree.toEpochMilli());
                    Assertions.assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS0");
                })
                .assertNext(op-> {
                    Assertions.assertThat(op.getCards().size()).isEqualTo(2);
                    Assertions.assertThat(op.getPublishDate()).isEqualTo(nowPlusOne.toEpochMilli());
                    Assertions.assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS1");
                    Assertions.assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS9");
                })
                .expectComplete()
                .verify();
    }

    @Test
    public void fetchPastJSON() {
        log.info(String.format("Fetching past before now (%s), published after now plus three hours(%s)", format(now), format(nowPlusThree)));
        StepVerifier.create(repository.findPastOnlyJSON(nowPlusThree.toEpochMilli(),now.toEpochMilli())
                .map(s-> readCardOperation(s))
                .doOnNext(this::logCardOperation))
                .assertNext(op-> {
                    Assertions.assertThat(op.getPublishDate()).isEqualTo(nowMinusThree.toEpochMilli());
                    Assertions.assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS0");
                })
                .assertNext(op-> {
                    Assertions.assertThat(op.getCards().size()).isEqualTo(2);
                    Assertions.assertThat(op.getPublishDate()).isEqualTo(nowPlusOne.toEpochMilli());
                    Assertions.assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS1");
                    Assertions.assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS9");
                })
                .expectComplete()
                .verify();
    }

    private CardOperation readCardOperation(String s) {
        try {
            return mapper.readValue(s, CardOperationConsultationData.class);
        } catch (IOException e) {
            log.error(String.format("Unable to delinearize %s",CardOperationConsultationData.class.getSimpleName()),e);
            return null;
        }
    }

    @NotNull
    private String format(Instant now) {
        return ZONED_FORMATTER.format(now);
    }

    @NotNull
    private String format(Long now) {
        return ZONED_FORMATTER.format(Instant.ofEpochMilli(now));
    }

    @Test
    public void fetchFuture() {
        log.info(String.format("Fetching future from now(%s), published after now(%s)", format(now), format(now)));
        StepVerifier.create(repository.findFutureOnly(now.toEpochMilli(),now.toEpochMilli())
                .doOnNext(this::logCardOperation))
                .assertNext(op-> {
                    Assertions.assertThat(op.getCards().size()).isEqualTo(3);
                    Assertions.assertThat(op.getPublishDate()).isEqualTo(nowMinusThree.toEpochMilli());
                    Assertions.assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS4");
                    Assertions.assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS5");
                    Assertions.assertThat(op.getCards().get(2).getId()).isEqualTo("PUBLISHER_PROCESS8");
                })
            .expectComplete()
            .verify();
        log.info(String.format("Fetching future from now minus two hours(%s), published after now(%s)", format(nowMinusTwo), format(now)));
        StepVerifier.create(repository.findFutureOnly(now.toEpochMilli(), nowMinusTwo.toEpochMilli())
                .doOnNext(this::logCardOperation) )
                .assertNext(op-> {
                    Assertions.assertThat(op.getCards().size()).isEqualTo(4);
                    Assertions.assertThat(op.getPublishDate()).isEqualTo(nowMinusThree.toEpochMilli());
                    Assertions.assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS2");
                    Assertions.assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS4");
                    Assertions.assertThat(op.getCards().get(2).getId()).isEqualTo("PUBLISHER_PROCESS5");
                    Assertions.assertThat(op.getCards().get(3).getId()).isEqualTo("PUBLISHER_PROCESS8");
                })
            .expectComplete()
            .verify();
        log.info(String.format("Fetching future from now minus two hours(%s), published after now plus three hours(%s)", format(nowMinusTwo), format(nowPlusThree)));
        StepVerifier.create(repository.findFutureOnly(nowPlusThree.toEpochMilli(),nowMinusTwo.toEpochMilli())
                .doOnNext(this::logCardOperation) )
                .assertNext(op-> {
                    Assertions.assertThat(op.getCards().size()).isEqualTo(4);
                    Assertions.assertThat(op.getPublishDate()).isEqualTo(nowMinusThree.toEpochMilli());
                    Assertions.assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS2");
                    Assertions.assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS4");
                    Assertions.assertThat(op.getCards().get(2).getId()).isEqualTo("PUBLISHER_PROCESS5");
                    Assertions.assertThat(op.getCards().get(3).getId()).isEqualTo("PUBLISHER_PROCESS8");
                })
                .assertNext(op-> {
                    Assertions.assertThat(op.getCards().size()).isEqualTo(2);
                    Assertions.assertThat(op.getPublishDate()).isEqualTo(nowPlusOne.toEpochMilli());
                    Assertions.assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS3");
                    Assertions.assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS10");
                })
            .expectComplete()
            .verify();
    }

    @Test
    public void fetchFutureJSON() {
        log.info(String.format("Fetching future from now minus two hours(%s), published after now plus three hours(%s)", format(nowMinusTwo), format(nowPlusThree)));
        StepVerifier.create(repository.findFutureOnlyJSON(nowPlusThree.toEpochMilli(),nowMinusTwo.toEpochMilli())
                .map(this::readCardOperation)
                .doOnNext(this::logCardOperation)
        )
                .assertNext(op-> {
                    Assertions.assertThat(op.getCards().size()).isEqualTo(4);
                    Assertions.assertThat(op.getPublishDate()).isEqualTo(nowMinusThree.toEpochMilli());
                    Assertions.assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS2");
                    Assertions.assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS4");
                    Assertions.assertThat(op.getCards().get(2).getId()).isEqualTo("PUBLISHER_PROCESS5");
                    Assertions.assertThat(op.getCards().get(3).getId()).isEqualTo("PUBLISHER_PROCESS8");
                })
                .assertNext(op-> {
                    Assertions.assertThat(op.getCards().size()).isEqualTo(2);
                    Assertions.assertThat(op.getPublishDate()).isEqualTo(nowPlusOne.toEpochMilli());
                    Assertions.assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS3");
                    Assertions.assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS10");
                })
                .expectComplete()
                .verify();
    }

    private void logCardOperation(CardOperation o) {
        log.info("op publication: " + format(o.getPublishDate()));
        for (LightCard c : o.getCards()) {
            log.info(String.format("card [%s]: %s",c.getId(), format(c.getStartDate())));
        }
    }

    @Test
    public void fetchUrgent() {
        log.info(String.format("Fetching urgent from now minus one hours(%s) and now plus one hours(%s), published after now (%s)", format(nowMinusOne), format(nowPlusOne), format(now)));
        StepVerifier.create(repository.findUrgent(now.toEpochMilli(),nowMinusOne.toEpochMilli(),nowPlusOne.toEpochMilli())
                .doOnNext(this::logCardOperation) )
                .assertNext(op-> {
                    Assertions.assertThat(op.getCards().size()).isEqualTo(5);
                    Assertions.assertThat(op.getPublishDate()).isEqualTo(nowMinusThree.toEpochMilli());
                    Assertions.assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS6");
                    Assertions.assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS7");
                    Assertions.assertThat(op.getCards().get(2).getId()).isEqualTo("PUBLISHER_PROCESS0");
                    Assertions.assertThat(op.getCards().get(3).getId()).isEqualTo("PUBLISHER_PROCESS2");
                    Assertions.assertThat(op.getCards().get(4).getId()).isEqualTo("PUBLISHER_PROCESS4");
                })
            .expectComplete()
            .verify();
    }

    @Test
    public void fetchUrgentJSON() {
        log.info(String.format("Fetching urgent from now minus one hours(%s) and now plus one hours(%s), published after now (%s)", format(nowMinusOne), format(nowPlusOne), format(now)));
        StepVerifier.create(repository.findUrgentJSON(now.toEpochMilli(),nowMinusOne.toEpochMilli(),nowPlusOne.toEpochMilli())
                .map(this::readCardOperation)
                .doOnNext(this::logCardOperation) )
                .assertNext(op-> {
                    Assertions.assertThat(op.getCards().size()).isEqualTo(5);
                    Assertions.assertThat(op.getPublishDate()).isEqualTo(nowMinusThree.toEpochMilli());
                    Assertions.assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS6");
                    Assertions.assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS7");
                    Assertions.assertThat(op.getCards().get(2).getId()).isEqualTo("PUBLISHER_PROCESS0");
                    Assertions.assertThat(op.getCards().get(3).getId()).isEqualTo("PUBLISHER_PROCESS2");
                    Assertions.assertThat(op.getCards().get(4).getId()).isEqualTo("PUBLISHER_PROCESS4");
                })
                .expectComplete()
                .verify();
    }

    @NotNull
    private Predicate<CardConsultationData> computeCardPredicate(CardConsultationData card) {
        Predicate<CardConsultationData> predicate = c -> card.getId().equals(c.getId());
        predicate = predicate.and(c -> c.getDetails().size() == 1);
        predicate = predicate.and(c -> c.getDetails().get(0).getTitlePosition() == TitlePositionEnum.UP);
        return predicate;
    }


    private CardConsultationData createSimpleCard(int processNo, Instant publication, Instant start, Instant end) {
        CardConsultationData card = CardConsultationData.builder()
                .processId("PROCESS" + processNo)
                .publisher("PUBLISHER")
                .publisherVersion("0")
                .startDate(start.toEpochMilli())
                .endDate(end!=null?end.toEpochMilli():null)
                .severity(SeverityEnum.ALARM)
                .title(I18nConsultationData.builder().key("title").build())
                .summary(I18nConsultationData.builder().key("summary").build())
                .recipient(RecipientConsultationData.builder()
                        .type(RecipientEnum.DEADEND)
                        .build())
                .build();
        prepare(card, publication.toEpochMilli());
        return card;
    }

    private static void prepare(CardConsultationData card, Long publishDate) {
        card.setUid(UUID.randomUUID().toString());
        card.setPublishDate(publishDate);
        card.setId(card.getPublisher() + "_" + card.getProcessId());
        card.setShardKey(Math.toIntExact(card.getStartDate() % 24 * 1000));
    }

}