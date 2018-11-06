/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.publication.services;

import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.lfenergy.operatorfabric.cards.model.CardOperationTypeEnum;
import org.lfenergy.operatorfabric.cards.publication.model.ArchivedCardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.model.CardCreationReportData;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.utilities.SimulatedTime;
import org.reactivestreams.Publisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.BulkOperations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import reactor.core.publisher.EmitterProcessor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuple3;
import reactor.util.function.Tuples;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.function.Function;

/**
 * <p>Responsible of Reactive Write of Cards in card mongo collection</p>
 * <p>This service also generate an ArchiveCard object persisted in archivedCard mongo collection</p>
 * <p>There is two way of pushing cards to this service:
 * <ul>
 * <li>Synchronous cards</li>
 * <li>Asynchronous : Cards is pushed to an internal {@link FluxSink}, the cards treatment is windowed
 * (see {@link reactor.core.publisher.Flux#windowTimeout})
 * and each window is treated in parallel (see {@link Schedulers#parallel()})</li>
 * </ul>
 * </p>
 * <p>
 * Treatments includes :
 * <ul>
 * <li>Validate card data (Bean validation)</li>
 * <li>Creating an {@link ArchivedCardPublicationData} along the {@link CardPublicationData} (passed has tuple)</li>
 * <li>Removing {@link CardPublicationData} with duplicate id (keeping only the latest one) throught a reduce operation</li>
 * <li>Fuse cards to add into mongo bulk operations to avoid multiple IOs</li>
 * <li>Execute bulk operations</li>
 * </ul>
 * </p>
 *
 * <p>Configuration properties available in spring configuration</p>
 * <ul>
 *     <li>opfab.write.window: treatment window maximum size</li>
 *     <li>opfab.write.timeout: maximum wait time before treatment window creation</li>
 * </ul>
 *
 * @author David Binder
 */
@Service
@Slf4j
public class CardWriteService {

    private final EmitterProcessor<CardPublicationData> processor;
    private final FluxSink<CardPublicationData> sink;

    //injected
    private RecipientProcessor recipientProcessor;
    private MongoTemplate template;
    private LocalValidatorFactoryBean localValidatorFactoryBean;
    private CardNotificationService cardNotificationService;


    @Autowired
    public CardWriteService(RecipientProcessor recipientProcessor,
                            MongoTemplate template,
                            LocalValidatorFactoryBean localValidatorFactoryBean,
                            CardNotificationService cardNotificationService,
                            @Value("${opfab.write.window:1000}") int windowSize,
                            @Value("${opfab.write.timeout:500}") long windowTimeOut
                            ) {

        this.recipientProcessor = recipientProcessor;
        this.template = template;
        this.localValidatorFactoryBean = localValidatorFactoryBean;
        this.cardNotificationService = cardNotificationService;

        this.processor = EmitterProcessor.create();
        this.sink = this.processor.sink();
        processor
                //parallelizing card treatments
                .flatMap(c -> Mono.just(c).subscribeOn(Schedulers.parallel()))
                //batching cards
                .windowTimeout(windowSize, Duration.ofMillis(windowTimeOut))
                //remembering startime for measurement
                .map(card -> Tuples.of(card, System.nanoTime(), SimulatedTime.getInstance().computeNow().toEpochMilli()))
                //trigger batched treatment upon window readiness
                .subscribe(cardAndTimeTuple -> handleWindowedCardFlux(cardAndTimeTuple));
    }

    private void handleWindowedCardFlux(Tuple3<Flux<CardPublicationData>, Long, Long> cardAndTimeTuple) {
        long windowStart = cardAndTimeTuple.getT2();
        Flux<CardPublicationData> cards = registerRecipientProcess(cardAndTimeTuple.getT1());
        cards = registerTolerantValidationProcess(cards, cardAndTimeTuple.getT3());
        registerPersistingProcess(cards, windowStart)
                .doOnError(t -> log.error("Unexpected Error arose", t))
                .subscribe();
    }

    /**
     * Process effective recipients.
     **/
    private Flux<CardPublicationData> registerRecipientProcess(Flux<CardPublicationData> cards) {
        return cards
                .doOnNext(recipientProcessor::processAll);
    }

    /**
     * Register validation process in flux, still allowing proccess to carry on if error arise
     *
     * @param cards
     * @param publishDate
     * @return
     */
    private Flux<CardPublicationData> registerTolerantValidationProcess(Flux<CardPublicationData> cards, Long publishDate) {
        return cards
                // prepare card computed data (id, shardkey)
                .flatMap(doOnNextOnErrorContinue(c -> c.prepare(publishDate)))
                // JSR303 bean validation of card
                .flatMap(doOnNextOnErrorContinue(this::validate));
    }

    /**
     * Register validation process in flux. If error arrise breaks the process.
     *
     * @param cards
     * @param publishDate
     * @return
     */
    private Flux<CardPublicationData> registerValidationProcess(Flux<CardPublicationData> cards, Long publishDate) {
        return cards
                // prepare card computed data (id, shardkey)
                .doOnNext(c -> c.prepare(Math.round(publishDate / 1000d) * 1000))
                // JSR303 bean validation of card
                .doOnNext(this::validate);
    }

    /**
     * Resgister mongo persisting part of the precess
     *
     * @param cards
     * @param windowStart
     * @return
     */
    private Mono<Integer> registerPersistingProcess(Flux<CardPublicationData> cards, long windowStart) {
        // this reduce function removes CardPublicationData "duplicates" (based on id) but leaves ArchivedCard as is
        BiFunction<Tuple2<LinkedList<CardPublicationData>, ArrayList<ArchivedCardPublicationData>>,
                Tuple2<CardPublicationData, ArchivedCardPublicationData>,
                Tuple2<LinkedList<CardPublicationData>, ArrayList<ArchivedCardPublicationData>>>
                fct = (tuple, item) -> {
            tuple.getT1().add(item.getT1());
            tuple.getT2().add(item.getT2());
            return tuple;
        };

        return cards
                // creating archived card
                .map(card -> Tuples.of(card, new ArchivedCardPublicationData(card)))
                // removing duplicates and assembling card data in collections
                .reduce(Tuples.of(new LinkedList<>(), new ArrayList<>()), fct)
                // switch to blockable thread before sync treatments (mongo writes)
                .publishOn(Schedulers.immediate())
                .flatMap(cardsAndArchivedCards ->
                        Mono.defer(() -> {
                            doIndexCards(cardsAndArchivedCards.getT1());
                            doIndexArchivedCards(cardsAndArchivedCards.getT2());
                            return Mono.just(true);
                        })
                                .then(Mono.just(Tuples.of(cardsAndArchivedCards.getT1(), cardsAndArchivedCards.getT2().size())))
                )
                .doOnNext(t -> notifyCards(t.getT1()))
                .doOnNext(t -> {
                    if (t.getT2() > 0 && log.isDebugEnabled()) {
                        logMeasures(windowStart, t.getT2());
                    }
                })
                .map(Tuple2::getT2);
    }

    /**
     * Delegates notification to any concerned party to {@link CardNotificationService}
     *
     * @param cards
     */
    private void notifyCards(Collection<CardPublicationData> cards) {
        cardNotificationService.notifyCards(cards, CardOperationTypeEnum.ADD);
    }

    /**
     * Hacks a fault tolerant step in flux
     *
     * @param onNext
     * @return
     */
    private static Function<CardPublicationData, Publisher<CardPublicationData>> doOnNextOnErrorContinue(Consumer<CardPublicationData> onNext) {
        return c -> {
            try {
                onNext.accept(c);
                return Mono.just(c);
            } catch (Exception e) {
                log.warn("Error aaroseand will be ignored", e);
                return Mono.empty();
            }
        };
    }

    /**
     * Apply bean validation to card
     *
     * @param c
     * @throws ConstraintViolationException if there is an error during validation based on object annotation configuration
     */
    private void validate(CardPublicationData c) throws ConstraintViolationException {
        Set<ConstraintViolation<CardPublicationData>> results = localValidatorFactoryBean.validate(c);
        if (!results.isEmpty())
            throw new ConstraintViolationException(results);
    }

    /**
     * Asynchronous fire and forget card push in the persisting/notification process
     *
     * @param pushedCards
     */
    public void pushCardsAsyncParallel(Flux<CardPublicationData> pushedCards) {
        pushedCards.subscribe(sink::next);
    }

    /**
     * Synchronous card push in the persisting/notification process use the same treatment as thoses associated to
     * the internal {@link FluxSink} but adds a last step to prepare {@link CardCreationReportData}
     *
     * @param pushedCards
     */
    public Mono<CardCreationReportData> createCardsWithResult(Flux<CardPublicationData> pushedCards) {
        long windowStart = Instant.now().toEpochMilli();
        Flux<CardPublicationData> cards = registerRecipientProcess(pushedCards);
        cards = registerValidationProcess(cards, SimulatedTime.getInstance().computeNow().toEpochMilli());
        return registerPersistingProcess(cards, windowStart)
                .doOnNext(count -> log.info(count + " pushedCards persisted"))
                .map(count -> new CardCreationReportData(count, "All pushedCards were succesfully handled"))
                .onErrorResume(e -> {
                    log.error("Unexpected error during pushedCards persistence", e);
                    return Mono.just(new CardCreationReportData(0, "Error, unnable to handle pushedCards: " + e.getMessage
                            ()));
                });

    }

    /**
     * prepare and runs batch persist operation for {@link CardPublicationData}
     *
     * @param cards
     */
    private void doIndexCards(List<CardPublicationData> cards) {
        if (cards.isEmpty())
            return;
        BulkOperations bulkCard = template.bulkOps(BulkOperations.BulkMode.ORDERED, CardPublicationData.class);
        cards.forEach(c -> {
            log.info("preparing to write " + c.toString());
            addBulkCard(bulkCard, c);
        });
        bulkCard.execute();

    }

    /**
     * prepare and batch persist operation for {@link ArchivedCardPublicationData}
     *
     * @param archivedCards
     */
    private void doIndexArchivedCards(List<ArchivedCardPublicationData> archivedCards) {
        if (archivedCards.isEmpty())
            return;
        BulkOperations bulkArchived = template.bulkOps(BulkOperations.BulkMode.ORDERED, ArchivedCardPublicationData.class);
        archivedCards.forEach(c -> addBulkArchivedCard(bulkArchived, c));
        bulkArchived.execute();

    }


    /**
     * Adds unitary upsert (update or insert) operation for {@link CardPublicationData}
     *
     * @param bulk
     * @param c
     */
    private void addBulkCard(BulkOperations bulk, CardPublicationData c) {
        Document objDocument = new Document();
        template.getConverter().write(c, objDocument);
        Update update = new Update();
        objDocument.entrySet().forEach(e -> update.set(e.getKey(), e.getValue()));
        bulk.upsert(Query.query(Criteria.where("_id").is(c.getId())), update);
    }

    /**
     * Adds unitary insert operation for {@link ArchivedCardPublicationData}
     *
     * @param bulkArchived
     * @param c
     */
    private void addBulkArchivedCard(BulkOperations bulkArchived, ArchivedCardPublicationData c) {
        bulkArchived.insert(c);
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
        log.debug(count + " cards handled in " + cardWindowDurationMillis + " ms each (total: " + windowDurationMillis + ")");
    }
}
