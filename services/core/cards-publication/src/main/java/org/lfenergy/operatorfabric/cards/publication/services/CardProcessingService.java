/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.lfenergy.operatorfabric.cards.publication.services;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.model.CardOperationTypeEnum;
import org.lfenergy.operatorfabric.cards.publication.model.ArchivedCardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.model.CardCreationReportData;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.services.clients.impl.ExternalAppClientImpl;
import org.lfenergy.operatorfabric.cards.publication.services.processors.UserCardProcessor;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import java.time.Instant;
import java.util.Set;
import java.util.function.Consumer;

/**
 * <p>
 * Responsible of processing card : check format , save in repository and send
 * notification
 */
@Service
@Slf4j
public class CardProcessingService {


    @Autowired
    private RecipientProcessor recipientProcessor;
    @Autowired
    private LocalValidatorFactoryBean localValidatorFactoryBean;
    @Autowired
    private CardNotificationService cardNotificationService;
    @Autowired
    private CardRepositoryService cardRepositoryService;
    @Autowired
    private UserCardProcessor userCardProcessor;
    @Autowired
    private ExternalAppClientImpl externalAppClient;



    public Mono<CardCreationReportData> processCards(Flux<CardPublicationData> pushedCards) {
        long windowStart = Instant.now().toEpochMilli();
        Flux<CardPublicationData> cards = registerRecipientProcess(pushedCards);
        cards = registerValidationProcess(cards);
        return registerPersistenceAndNotificationProcess(cards, windowStart)
                .doOnNext(count -> log.debug("{} pushed Cards persisted", count))
                .map(count -> new CardCreationReportData(count, "All pushedCards were successfully handled"))
                .onErrorResume(e -> {
                    log.error("Unexpected error during pushed Cards persistence", e);
                    return Mono.just(
                            new CardCreationReportData(0, "Error, unable to handle pushed Cards: " + e.getMessage()));
                });
    }

    public Mono<CardCreationReportData> processUserCards(Flux<CardPublicationData> pushedCards, User user) {
        long windowStart = Instant.now().toEpochMilli();
        Flux<CardPublicationData> cards = registerRecipientProcess(pushedCards);
        cards=registerValidationProcess(cards);
        cards= userCardPublisherProcess(cards,user);
        cards= sendCardToExternalAppProcess(cards);
        return registerPersistenceAndNotificationProcess(cards, windowStart)
                .doOnNext(count -> log.debug("{} pushed Cards persisted", count))
                .map(count -> new CardCreationReportData(count, "All pushedCards were successfully handled"))
                .onErrorResume(e -> {
                    log.error("Unexpected error during pushed Cards persistence", e);
                    return Mono.just(
                            new CardCreationReportData(0, "Error, unable to handle pushed Cards: " + e.getMessage()));
                });
    }


    private Flux<CardPublicationData> registerRecipientProcess(Flux<CardPublicationData> cards) {
        return cards.doOnNext(ignoreErrorDo(recipientProcessor::processAll));
    }

    private Flux<CardPublicationData> userCardPublisherProcess(Flux<CardPublicationData> cards, User user) {
        return cards.doOnNext(card-> userCardProcessor.processPublisher(card,user));
    }

    private Flux<CardPublicationData> sendCardToExternalAppProcess(Flux<CardPublicationData> cards) {
        return cards.doOnNext(card-> externalAppClient.sendCardToExternalApplication(card));
    }

    private static Consumer<CardPublicationData> ignoreErrorDo(Consumer<CardPublicationData> onNext) {
        return c -> {
            try {
                onNext.accept(c);
            } catch (Exception e) {
                log.warn("Error arose and will be ignored", e);
            }
        };
    }

    /**
     * Registers validation process in flux. If an error arise it breaks the
     * process.
     *
     * @param cards
     * @return
     */
    private Flux<CardPublicationData> registerValidationProcess(Flux<CardPublicationData> cards) {
        return cards
                // prepare card computed data (id, shardkey)
                .doOnNext(c -> c.prepare(Instant.ofEpochMilli(Math.round(Instant.now().toEpochMilli() / 1000d) * 1000)))
                // JSR303 bean validation of card
                .doOnNext(this::validate);
    }

    /**
     * Apply bean validation to card
     *
     * @param c
     * @throws ConstraintViolationException if there is an error during validation
     *                                      based on object annotation configuration
     */
    private void validate(CardPublicationData c) throws ConstraintViolationException {

        Set<ConstraintViolation<CardPublicationData>> results = localValidatorFactoryBean.validate(c);
        if (!results.isEmpty())
            throw new ConstraintViolationException(results);

        // constraint check : endDate must be after startDate
        Instant endDateInstant = c.getEndDate();
        Instant startDateInstant = c.getStartDate();
        if ((endDateInstant != null) && (startDateInstant != null) && (endDateInstant.compareTo(startDateInstant) < 0))
            throw new ConstraintViolationException("constraint violation : endDate must be after startDate", null);

        // constraint check : timeSpans list : each end date must be after his start
        // date
        if (c.getTimeSpans() != null)
            for (int i = 0; i < c.getTimeSpans().size(); i++) {
                if (c.getTimeSpans().get(i) != null) {
                    Instant endInstant = c.getTimeSpans().get(i).getEnd();
                    Instant startInstant = c.getTimeSpans().get(i).getStart();
                    if ((endInstant != null) && (startInstant != null) && (endInstant.compareTo(startInstant) < 0))
                        throw new ConstraintViolationException(
                                "constraint violation : TimeSpan.end must be after TimeSpan.start", null);
                }
            }
    }

    /**
     * Save and notify card
     *
     * @param cards
     * @param windowStart
     * @return
     */
    private Mono<Integer> registerPersistenceAndNotificationProcess(Flux<CardPublicationData> cards, long windowStart) {

        return cards.doOnNext(card -> {
            cardRepositoryService.saveCard(card);
            cardRepositoryService.saveCardToArchive(new ArchivedCardPublicationData(card));
            cardNotificationService.notifyOneCard(card, CardOperationTypeEnum.ADD);
        }).reduce(0, (count, card) -> count + 1).doOnNext(size -> {
            if (size > 0 && log.isDebugEnabled()) {
                logMeasures(windowStart, size);
            }
        });
    }

    public void deleteCard(String processId) {

        CardPublicationData cardToDelete = cardRepositoryService.findCardToDelete(processId);
        if (null != cardToDelete) {
            cardNotificationService.notifyOneCard(cardToDelete, CardOperationTypeEnum.DELETE);
            cardRepositoryService.deleteCard(cardToDelete);
        }
    }

    /**
     * Logs card count and elapsed time since window start
     *
     * @param windowStart
     * @param count
     */
    private void logMeasures(long windowStart, long count) {
        long windowDuration = System.nanoTime() - windowStart;
        double windowDurationMillis = windowDuration / 1000000d;
        double cardWindowDurationMillis = windowDurationMillis / count;
        log.debug("{} cards handled in {} ms each (total: {})", count, cardWindowDurationMillis, windowDurationMillis);
    }
}
