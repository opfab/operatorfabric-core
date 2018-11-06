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
 * <p>In the meantime, Cards treatment is windowed (see {@link reactor.core.publisher.Flux#windowTimeout})
 *  * and each window is treated in parallel (see {@link Schedulers#parallel()})</p>
 *
 * @author David Binder
 */
@Service
@Slf4j
public class CardWriteService {

    //TODO change static variables for spring properties
    private static final int WINDOW_SIZE =1000;
    private static final long WINDOW_TIME_OUT =500;
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
                            CardNotificationService cardNotificationService){

        this.recipientProcessor = recipientProcessor;
        this.template = template;
        this.localValidatorFactoryBean = localValidatorFactoryBean;
        this.cardNotificationService = cardNotificationService;

        this.processor = EmitterProcessor.create();
        this.sink = this.processor.sink();
        processor
           //parallelizing card treatments
           .flatMap(c-> Mono.just(c).subscribeOn(Schedulers.parallel()))
           //batching cards
           .windowTimeout(WINDOW_SIZE,Duration.ofMillis(WINDOW_TIME_OUT))
           //remembering startime for measurement
           .map(card->Tuples.of(card,System.nanoTime(),SimulatedTime.getInstance().computeNow().toEpochMilli()))
           //trigger batched treatment upon window readiness
           .subscribe(cardAndTimeTuple -> handleWindowedCardFlux(cardAndTimeTuple));
    }

    private void handleWindowedCardFlux(Tuple3<Flux<CardPublicationData>, Long, Long> cardAndTimeTuple) {
        long windowStart = cardAndTimeTuple.getT2();
        Flux<CardPublicationData> cards = registerRecipientProcess(cardAndTimeTuple.getT1());
        cards = registerTolerantValidationProcess(cards,cardAndTimeTuple.getT3());
        registerPersistingProcess(cards, windowStart)
           .doOnError(t -> log.error("Unexpected Error arrose", t))
           .subscribe();
    }

    /** Process effective recipients. **/
    private Flux<CardPublicationData> registerRecipientProcess(Flux<CardPublicationData> cards){
        return cards
           .doOnNext(recipientProcessor::processAll);
    }

    /**
     * Register validation process in flux, still allowing proccess to carry on if error arise
     * @param cards
     * @param publishDate
     * @return
     */
    private Flux<CardPublicationData> registerTolerantValidationProcess(Flux<CardPublicationData> cards, Long publishDate){
        return cards
           // prepare card computed data (id, shardkey)
           .flatMap(doOnNextOnErrorContinue(c->c.prepare(publishDate)))
           // JSR303 bean validation of card
           .flatMap(doOnNextOnErrorContinue(this::validate));
    }

    /**
     * Register validation process in flux. If error arrise breaks the process.
     * @param cards
     * @param publishDate
     * @return
     */
    private Flux<CardPublicationData> registerValidationProcess(Flux<CardPublicationData> cards, Long publishDate){
        return cards
           // prepare card computed data (id, shardkey)
           .doOnNext(c->c.prepare(Math.round(publishDate/1000d)*1000))
           // JSR303 bean validation of card
           .doOnNext(this::validate);
    }

    /**
     * Res=gister mongo persisting part of the precess
     * @param cards
     * @param windowStart
     * @return
     */
    private Mono<Integer> registerPersistingProcess(Flux<CardPublicationData> cards, long windowStart){
        // this reduce function removes CardPublicationData "duplicates" (based on id) but leaves ArchivedCard as is
        BiFunction<Tuple3<HashMap<String,CardPublicationData>,ArrayList<ArchivedCardPublicationData>,HashSet<String>>,
           Tuple2<CardPublicationData, ArchivedCardPublicationData>,
           Tuple3<HashMap<String,CardPublicationData>,ArrayList<ArchivedCardPublicationData>,HashSet<String>>>
           fct = (tuple, item)->{
            tuple.getT1().put(item.getT1().getId(),item.getT1());
            tuple.getT2().add(item.getT2());
            tuple.getT3().add(item.getT1().getId());
            return tuple;
        };

        return cards
           // creating archived card
           .map(card -> Tuples.of(card, new ArchivedCardPublicationData(card)))
           // removing duplicates and assembling card data in collections
           .reduce(Tuples.of(new LinkedHashMap<>(), new ArrayList<>(), new HashSet<>()), fct)
           // switch to blockable thread before sync treatments (mongo writes)
           .publishOn(Schedulers.immediate())
           .flatMap(tuple ->
              Mono.defer(() -> {
                  doIndexCards(tuple);
                  doIndexArchivedCards(tuple);
                  return Mono.just(true);
              })
                 .then(Mono.just(Tuples.of(tuple.getT1().values(),tuple.getT2().size())))
           )
           .doOnNext(t->notifyCards(t.getT1()))
           .doOnNext(t -> {
               if (t.getT2() > 0 && log.isDebugEnabled()) {
                   logMeasures(windowStart, t.getT2());
               }
           })
           .map(Tuple2::getT2);
    }

    private void notifyCards(Collection<CardPublicationData> cards) {
        cardNotificationService.notifyCards(cards,CardOperationTypeEnum.ADD);
    }

    private static Function<CardPublicationData, Publisher<CardPublicationData>> doOnNextOnErrorContinue(Consumer<CardPublicationData> onNext){
        return c->{
            try{
                onNext.accept(c);
                return Mono.just(c);
            }catch(Exception e){
                log.warn("Error aaroseand will be ignored",e);
                return Mono.empty();
            }
        };
    }

    private void validate(CardPublicationData c) throws ConstraintViolationException {
        Set<ConstraintViolation<CardPublicationData>> results = localValidatorFactoryBean.validate(c);
        if(!results.isEmpty())
            throw new ConstraintViolationException(results);
    }

    public void createCardsAsyncParallel(Flux<CardPublicationData> cards){
        cards.subscribe(sink::next);
    }

    public Mono<CardCreationReportData> createCardsWithResult(Flux<CardPublicationData> inputCards){
        long windowStart = Instant.now().toEpochMilli();
        Flux<CardPublicationData> cards = registerRecipientProcess(inputCards);
        cards = registerValidationProcess(cards,SimulatedTime.getInstance().computeNow().toEpochMilli());
        return registerPersistingProcess(cards, windowStart)
           .doOnNext(count->log.info(count+" cards persisted"))
           .map(count->new CardCreationReportData(count,"All cards were succesfully handled"))
           .onErrorResume(e-> {
               log.error("Unexpected error during cards persistence",e);
               return Mono.just(new CardCreationReportData(0,"Error, unnable to handle cards: "+e.getMessage
                  ()));
           });

    }

    private void doIndexCards(Tuple3<HashMap<String, CardPublicationData>, ArrayList<ArchivedCardPublicationData>, HashSet<String>> tuple){
        if(tuple.getT1().isEmpty())
            return;
        BulkOperations bulkCard = template.bulkOps(BulkOperations.BulkMode.ORDERED, CardPublicationData.class);
        tuple.getT1().values().forEach(c->log.info("preparing to write "+c.toString()));
        tuple.getT1().values().forEach(c->addBulkCard(bulkCard,c));
        bulkCard.execute();

    }

    private void doIndexArchivedCards(Tuple3<HashMap<String, CardPublicationData>, ArrayList<ArchivedCardPublicationData>, HashSet<String>>  tuple){
        if(tuple.getT2().isEmpty())
            return;
        BulkOperations bulkArchived = template.bulkOps(BulkOperations.BulkMode.ORDERED, ArchivedCardPublicationData.class);
        tuple.getT2().forEach(c->addBulkArchivedCard(bulkArchived,c));
        bulkArchived.execute();

    }



    private void addBulkCard(BulkOperations bulk, CardPublicationData c) {
        Document objDocument = new Document();
        template.getConverter().write(c,objDocument);
        Update update = new Update();
        objDocument.entrySet().forEach(e->update.set(e.getKey(), e.getValue()));
        bulk.upsert(Query.query(Criteria.where("_id").is(c.getId())), update);
    }

    private void addBulkArchivedCard(BulkOperations bulkArchived, ArchivedCardPublicationData c) {
        bulkArchived.insert(c);
    }

    private void logMeasures(long windowStart, long count) {
        long windowDuration = System.nanoTime()-windowStart;
        double windowDurationMillis = windowDuration/1000000d;
        double cardWindowDurationMillis = windowDurationMillis/count;
        log.debug(count+" cards handled in "+cardWindowDurationMillis+" ms each (total: "+windowDurationMillis+")");
    }
}
