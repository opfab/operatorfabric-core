/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.publication.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.model.CardOperation;
import org.lfenergy.operatorfabric.cards.model.CardOperationTypeEnum;
import org.lfenergy.operatorfabric.cards.publication.model.CardData;
import org.lfenergy.operatorfabric.cards.publication.model.CardOperationData;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Exchange;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.EmitterProcessor;
import reactor.core.publisher.FluxSink;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

/**
 * <p></p>
 * Created on 06/08/18
 *
 * @author davibind
 */
@Service
@Slf4j
public class CardNotificationService {

    private static final int windowSize = 100;
    private static final long windowTimeOut = 2000;

    private final RabbitTemplate rabbitTemplate;
    private final TopicExchange groupExchange;
    private final DirectExchange userExchange;
    private final ObjectMapper mapper;
    private final EmitterProcessor<Tuple2<CardData, CardOperationTypeEnum>> processor;
    private final FluxSink<Tuple2<CardData, CardOperationTypeEnum>> sink;
    private AtomicInteger sequence = new AtomicInteger();
    private String uuid = UUID.randomUUID().toString();

    @Autowired
    public CardNotificationService(RabbitTemplate rabbitTemplate,
                                   TopicExchange groupExchange,
                                   DirectExchange userExchange,
                                   ObjectMapper mapper) {
        this.rabbitTemplate = rabbitTemplate;
        this.groupExchange = groupExchange;
        this.userExchange = userExchange;
        this.mapper = mapper;

        this.processor = EmitterProcessor.create();
        this.sink = this.processor.sink();
        this.processor
                //parallelizing card treatments
                .flatMap(c -> Mono.just(c).subscribeOn(Schedulers.parallel()))
                //batching cards
                .windowTimeout(windowSize, Duration.ofMillis(windowTimeOut))
                .subscribe(flux -> {
                    flux.map(t -> notifyCardsX(t.getT1(), t.getT2()))
                            .reduce(Tuples.of(new LinkedHashMap<String, List<CardOperation>>(), new LinkedHashMap<String, List<CardOperation>>()), (result, item) -> {
                                for (Map.Entry<String, CardOperationData.CardOperationDataBuilder> e : item.getT1().entrySet()) {
                                    List<CardOperation> opsList = result.getT1().get(e.getKey());
                                    if (opsList == null) {
                                        result.getT1().put(e.getKey(), opsList = new ArrayList<>());
                                    }
                                    opsList.add(e.getValue().build());
                                }

                                for (Map.Entry<String, CardOperationData.CardOperationDataBuilder> e : item.getT2().entrySet()) {
                                    List<CardOperation> opsList = result.getT2().get(e.getKey());
                                    if (opsList == null) {
                                        result.getT2().put(e.getKey(), opsList = new ArrayList<>());
                                    }
                                    opsList.add(e.getValue().build());
                                }
                                return result;
                            })
                            .map(t->{
                                //group card operation by types and publication/deletion date
                                return Tuples.of(fuseCardOperations(t.getT1()),fuseCardOperations(t.getT2()));
                            })

                            .subscribe(t -> {
                                sendOperation(t.getT1(), groupExchange);
                                sendOperation(t.getT2(), userExchange);
                            }
                    )
                    ;
                });
    }

    /**
     * group card operation by types and publication/deletion date
     *
     * TODO group at most by ten cards
     *
     * @param sourceMap
     * @return
     */
    private Map<String, List<CardOperation>> fuseCardOperations(LinkedHashMap<String, List<CardOperation>> sourceMap) {
        Map<String, List<CardOperation>> resultMap = new LinkedHashMap<>();
        for(Map.Entry<String, List<CardOperation>> groupEntry: sourceMap.entrySet()){
            Map<String,CardOperationData.CardOperationDataBuilder> sorted = new LinkedHashMap<>();
            for(CardOperation op:groupEntry.getValue()){
                String key = op.getPublicationDate()+op.getType().toString();
                CardOperationData.CardOperationDataBuilder existing = sorted.get(key);
                if(existing == null){
                    existing = CardOperationData.builder()
                            .publicationDate(op.getPublicationDate())
                            .type(op.getType());
                    sorted.put(key,existing);
                }
                existing.cardIds(op.getCardIds());
                existing.cards(op.getCards());
            }
           resultMap.put(groupEntry.getKey(),sorted.entrySet().stream().map(e->e.getValue().build()).collect(Collectors.toList()));

        }
        return resultMap;
    }

    public void notifyCards(Collection<CardData> cards, CardOperationTypeEnum type) {
        cards.forEach(c -> sink.next(Tuples.of(c, type)));
//        notifyCards0(cards,type);
    }


    private Tuple2<Map<String, CardOperationData.CardOperationDataBuilder>, Map<String, CardOperationData.CardOperationDataBuilder>> notifyCardsX(CardData card, CardOperationTypeEnum type) {
        Map<String, CardOperationData.CardOperationDataBuilder> groupCardsDictionnay = new HashMap<>();
        Map<String, CardOperationData.CardOperationDataBuilder> userCardsDictionnary = new HashMap<>();

        StringBuilder groupSB = new StringBuilder();
        int currentSize = 0;
        for (String g : card.getGroupRecipients()) {
            if (currentSize + g.getBytes().length > 200) {
                CardOperationData.CardOperationDataBuilder groupCards = groupCardsDictionnay.get(groupSB.toString());
                if (groupCards == null) {
                    groupCardsDictionnay.put(groupSB.toString(), groupCards = CardOperationData.builder().type(type)
                       .publicationDate(card.getPublishDate()));
                }
                addCardToOperation(card, groupCards, type);
                groupSB = new StringBuilder();
                currentSize = 0;
            } else {
                if (groupSB.length() != 0) {
                    currentSize++;
                    groupSB.append(".");
                }
                groupSB.append(g);
                currentSize += g.getBytes().length;
            }
        }

        if (currentSize > 0) {
            CardOperationData.CardOperationDataBuilder groupCards = groupCardsDictionnay.get(groupSB.toString());
            if (groupCards == null) {
                groupCardsDictionnay.put(groupSB.toString(), groupCards = CardOperationData.builder().type(type)
                   .publicationDate(card.getPublishDate()));
            }
            addCardToOperation(card, groupCards, type);
        }

        for (String u : card.getOrphanedUsers()) {
            CardOperationData.CardOperationDataBuilder userCards = userCardsDictionnary.get(u);
            if (userCards == null) {
                userCardsDictionnary.put(u, userCards = CardOperationData.builder().type(type)
                   .publicationDate(card.getPublishDate()));
            }
            addCardToOperation(card, userCards, type);
        }

        return Tuples.of(groupCardsDictionnay, userCardsDictionnary);
    }

    private void sendOperation(Map<String, List<CardOperation>> operationDictionnary, Exchange
            exchange) {
        operationDictionnary.entrySet().stream().
                forEach(entry -> {
                    entry.getValue().forEach(op->{
                        try {
                            rabbitTemplate.convertAndSend(
                                    exchange.getName(),
                                    entry.getKey(),
                                    mapper.writeValueAsString(op)
                            );
                            log.info("Operation sent to Exchange["+exchange.getName()+"] with routing key "+entry.getKey
                               ());
                        } catch (JsonProcessingException e) {
                            log.error("Unnable to linearize card to json on amqp notification");
                        }
                    });
                });
    }

    private void addCardToOperation(CardData c, CardOperationData.CardOperationDataBuilder cardOperation, CardOperationTypeEnum type) {
        switch (type) {
            case ADD:
            case UPDATE:
                cardOperation.card(c.toLightCard());
                break;
            case DELETE:
                cardOperation.cardId(c.getId());

        }
    }
}
