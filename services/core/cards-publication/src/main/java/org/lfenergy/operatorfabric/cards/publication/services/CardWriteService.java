/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.publication.services;

import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.lfenergy.operatorfabric.cards.model.CardCreationReport;
import org.lfenergy.operatorfabric.cards.model.CardOperationTypeEnum;
import org.lfenergy.operatorfabric.cards.publication.model.ArchivedCardData;
import org.lfenergy.operatorfabric.cards.publication.model.CardCreationReportData;
import org.lfenergy.operatorfabric.cards.publication.model.CardData;
import org.lfenergy.operatorfabric.cards.publication.model.Counter;
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
 * <p>this service also generate an ArchiveCard object persisted in archivedCard mongo collection</p>
 *
 * Created on 30/07/18
 *
 * @author davibind
 */
@Service
@Slf4j
public class CardWriteService {

    private final EmitterProcessor<CardData> processor;
    private static final int windowSize=1000;
    private static final long windowTimeOut=500;
    private final FluxSink<CardData> sink;

    //to inject
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
           .windowTimeout(windowSize,Duration.ofMillis(windowTimeOut))
           //remembering startime for measurement
           .map(card->Tuples.of(card,System.nanoTime(),SimulatedTime.getInstance().computeNow().toEpochMilli()))
           //trigger batched treatment upon window readiness
           .subscribe(cardAndTime->{
               long windowStart = cardAndTime.getT2();
               Flux<CardData> cards = registerRecipientProcess(cardAndTime.getT1());
               cards = registerTolerantValidationProcess(cards,cardAndTime.getT3());
               registerPersistingProcess(cards, windowStart)
                  .doOnError(t -> log.error("Unexpected Error arrose", t))
                  .subscribe();

           });
    }
    /** process effective recipients **/
    private Flux<CardData> registerRecipientProcess(Flux<CardData> cards){
        return cards
           .doOnNext(c->{
               ComputedRecipient cr = recipientProcessor.processAll(c);

           });
    }

    private Flux<CardData> registerTolerantValidationProcess(Flux<CardData> cards, Long publishDate){
        return cards
           // prepare card computed data (id, shardkey)
           .flatMap(doOnNextOnErrorContinue(c->c.prepare(publishDate)))
           // JSR303 bean validation of card
           .flatMap(doOnNextOnErrorContinue(c->validate(c)));
    }

    private Flux<CardData> registerValidationProcess(Flux<CardData> cards, Long publishDate){
        return cards
           // prepare card computed data (id, shardkey)
           .doOnNext(c->c.prepare(Math.round(publishDate/1000d)*1000))
           // JSR303 bean validation of card
           .doOnNext(c->validate(c));
    }

    private Mono<Integer> registerPersistingProcess(Flux<CardData> cards, long windowStart){
        // this reduce function removes CardData "duplicates" (based on id) but leaves ArchivedCard as is
        BiFunction<Tuple3<HashMap<String,CardData>,ArrayList<ArchivedCardData>,HashSet<String>>,
           Tuple2<CardData, ArchivedCardData>,
           Tuple3<HashMap<String,CardData>,ArrayList<ArchivedCardData>,HashSet<String>>>
           fct = (tuple, item)->{
            tuple.getT1().put(item.getT1().getId(),item.getT1());
            tuple.getT2().add(item.getT2());
            tuple.getT3().add(item.getT1().getId());
            return tuple;
        };

        return cards
           // creating archived card
           .map(card -> Tuples.of(card, new ArchivedCardData(card)))
           // removing duplicates and assembling card data in collections
           .reduce(Tuples.of(new LinkedHashMap<>(), new ArrayList<>(), new HashSet<>(), new Counter()), fct)
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
               if (t.getT2() > 0) {
                   registerMeasuresAndLog(windowStart, t.getT2());
               }
           })
           .map(t->t.getT2());
    }

    private void notifyCards(Collection<CardData> cards) {
        cardNotificationService.notifyCards(cards,CardOperationTypeEnum.ADD);
    }

    private static Function<CardData, Publisher<CardData>> doOnNextOnErrorContinue(Consumer<CardData> onNext){
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

    private void validate(CardData c) throws ConstraintViolationException {
        Set<ConstraintViolation<CardData>> results = localValidatorFactoryBean.validate(c);
        if(!results.isEmpty())
            throw new ConstraintViolationException(results);
    }

    public void createCardsAsyncParallel(Flux<CardData> cards){

        cards.subscribe(c->sink.next(c));
    }

    public Mono<? extends CardCreationReport> createCardsWithResult(Flux<CardData> inputCards){
        long windowStart = Instant.now().toEpochMilli();
        Flux<CardData> cards = registerRecipientProcess(inputCards);
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

    private void doIndexCards(Tuple3<HashMap<String, CardData>, ArrayList<ArchivedCardData>, HashSet<String>> tuple){
        if(tuple.getT1().isEmpty())
            return;
        BulkOperations bulkCard = template.bulkOps(BulkOperations.BulkMode.ORDERED, CardData.class);
        tuple.getT1().values().forEach(c->log.info("preparing to write "+c.toString()));
        tuple.getT1().values().forEach(c->addBulkCard(bulkCard,c));
        bulkCard.execute();

    }

    private void doIndexArchivedCards(Tuple3<HashMap<String, CardData>, ArrayList<ArchivedCardData>, HashSet<String>>  tuple){
        if(tuple.getT2().isEmpty())
            return;
        BulkOperations bulkArchived = template.bulkOps(BulkOperations.BulkMode.ORDERED, ArchivedCardData.class);
        tuple.getT2().forEach(c->addBulkArchivedCard(bulkArchived,c));
        bulkArchived.execute();

    }



    private void addBulkCard(BulkOperations bulk, CardData c) {
        Document objDocument = new Document();
        template.getConverter().write(c,objDocument);
        Update update = new Update();
        objDocument.entrySet().forEach(e->{
            update.set(e.getKey(), e.getValue());
        });
//        bulk.upsert(Query.query(Criteria.where("_id").is(c.getId()).and("shardKey").is(c.getShardKey())), update);
        bulk.upsert(Query.query(Criteria.where("_id").is(c.getId())), update);
    }

    private void addBulkArchivedCard(BulkOperations bulkArchived, ArchivedCardData c) {
        bulkArchived.insert(c);
    }

    private void registerMeasuresAndLog(long windowStart, long count) {
        long now = System.nanoTime();
//        long writeDuration = now-writeStart;
        long windowDuration = System.nanoTime()-windowStart;
//        double prepareDurationMillis = prepareDuration/1000000;
//        double writeDurationMillis = writeDuration/1000000;
        double windowDurationMillis = windowDuration/1000000;
//        double cardPrepareDurationMillis = prepareDurationMillis/count;
//        double cardWriteDurationMillis = writeDurationMillis/count;
        double cardWindowDurationMillis = windowDurationMillis/count;
        long time = Instant.now().toEpochMilli();
//        prepareVault.register(time,prepareDurationMillis,count);
//        writeVault.register(time,writeDurationMillis,count);
//        writeWindowVault.register(time, windowDurationMillis,count);
//        log.info(count+" cards prepared in "+cardPrepareDurationMillis+" ms each (total: "+prepareDurationMillis+")");
//        log.info(count+" cards wrote in "+cardWriteDurationMillis+" ms each (total: "+writeDurationMillis+")");
        log.info(count+" cards handled in "+cardWindowDurationMillis+" ms each (total: "+windowDurationMillis+")");
    }
}
