/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.publication.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.model.CardOperationTypeEnum;
import org.lfenergy.operatorfabric.cards.publication.model.Card;
import org.lfenergy.operatorfabric.cards.publication.model.CardOperation;
import org.lfenergy.operatorfabric.cards.publication.model.CardOperationData;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Exchange;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.EmitterProcessor;
import reactor.core.publisher.FluxSink;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

/**
 * <p>Aim of this service whose sole externally accessible method is
 * {@link #notifyCards(Collection, CardOperationTypeEnum)} is to
 * prepare data and notify AMQP exchange of it. Information about card
 * publication and deletion is then accessible to other services or
 * entities throught bindings to these exchanges.
 * </p>
 *
 * <p>Two exchanges are used, {@link #groupExchange} and {@link #userExchange}.
 * See amqp.xml resource file ([project]/services/core/cards-publication/src/main/resources/amqp.xml)
 * for their exact configuration</p>
 *
 * <p>In the meantime, Cards treatment is windowed (see {@link reactor.core.publisher.Flux#windowTimeout})
 * and each window is treated in parallel (see {@link Schedulers#parallel()})</p>
 * <p>Cards are then grouped in {@link CardOperation} by their type ({@link CardOperationTypeEnum#ADD} or
 * {@link CardOperationTypeEnum#DELETE}) and their {@link Card#getPublishDate()}</p>
 *
 * <p>Configuration properties available in spring configuration</p>
 * <ul>
 * <li>opfab.notification.window: treatment window maximum size</li>
 * <li>opfab.notification.timeout: maximum wait time before treatment window creation</li>
 * </ul>
 *
 * @author David Binder
 */
@Service
@Slf4j
public class CardNotificationService {

    private final RabbitTemplate rabbitTemplate;
    private final TopicExchange groupExchange;
    private final DirectExchange userExchange;
    private final ObjectMapper mapper;
    private final EmitterProcessor<Tuple2<CardPublicationData, CardOperationTypeEnum>> processor;
    private final FluxSink<Tuple2<CardPublicationData, CardOperationTypeEnum>> sink;

    @Autowired
    public CardNotificationService(RabbitTemplate rabbitTemplate,
                                   TopicExchange groupExchange,
                                   DirectExchange userExchange,
                                   ObjectMapper mapper,
                                   @Value("${opfab.notification.window:100}") int windowSize,
                                   @Value("${opfab.notification.timeout:1000}") long windowTimeOut
    ) {
        this.rabbitTemplate = rabbitTemplate;
        this.groupExchange = groupExchange;
        this.userExchange = userExchange;
        this.mapper = mapper;

        this.processor = EmitterProcessor.create();
        this.sink = this.processor.sink();
        this.processor
                //parallelizing card treatments
                .flatMap(tupleCard -> Mono.just(tupleCard).subscribeOn(Schedulers.parallel()))
                //batching cards
                .windowTimeout(windowSize, Duration.ofMillis(windowTimeOut))
                .subscribe(windowCard ->
                        windowCard.map(tupleCard -> arrangeUnitaryCardOperation(tupleCard.getT1(), tupleCard.getT2()))
                                .reduce(Tuples.of(new LinkedHashMap<String, List<CardOperation>>(), new LinkedHashMap<String, List<CardOperation>>()), (result, item) ->
                                        reduceCardOperationBuilders(result, item))
                                //group card operation by types and publication/deletion date
                                .map(t -> Tuples.of(fuseCardOperations(t.getT1()), fuseCardOperations(t.getT2())))

                                .subscribe(t -> {
                                    sendOperation(t.getT1(), groupExchange);
                                    sendOperation(t.getT2(), userExchange);
                                })
                );
    }

    /**
     * reduce unitary {@link CardOperationData.CardOperationDataBuilder} maps into maps of List of {@link CardOperation}
     *
     * @param result
     * @param item
     * @return
     */
    private Tuple2<LinkedHashMap<String, List<CardOperation>>, LinkedHashMap<String, List<CardOperation>>>
    reduceCardOperationBuilders(Tuple2<LinkedHashMap<String, List<CardOperation>>, LinkedHashMap<String, List<CardOperation>>> result, Tuple2<Map<String, CardOperationData.BuilderEncapsulator>, Map<String, CardOperationData.BuilderEncapsulator>> item) {
        for (Map.Entry<String, CardOperationData.BuilderEncapsulator> e : item.getT1().entrySet()) {
            List<CardOperation> opsList = result.getT1().get(e.getKey());
            if (opsList == null) {
                opsList = new ArrayList<>();
                result.getT1().put(e.getKey(), opsList);
            }
            opsList.add(e.getValue().builder().build());
        }

        for (Map.Entry<String, CardOperationData.BuilderEncapsulator> e : item.getT2().entrySet()) {
            List<CardOperation> opsList = result.getT2().get(e.getKey());
            if (opsList == null) {
                opsList = new ArrayList<>();
                result.getT2().put(e.getKey(), opsList);
            }
            opsList.add(e.getValue().builder().build());
        }
        return result;
    }

    /**
     * group card operation by types and publication/deletion date
     * <p>
     * TODO group at most by ten cards
     *
     * @param sourceMap
     * @return
     */
    private Map<String, List<CardOperation>> fuseCardOperations(LinkedHashMap<String, List<CardOperation>> sourceMap) {
        Map<String, List<CardOperation>> resultMap = new LinkedHashMap<>();
        for (Map.Entry<String, List<CardOperation>> groupEntry : sourceMap.entrySet()) {
            Map<String, CardOperationData.CardOperationDataBuilder> sorted = new LinkedHashMap<>();
            for (CardOperation op : groupEntry.getValue()) {
                String key = op.getPublicationDate() + op.getType().toString();
                CardOperationData.CardOperationDataBuilder existing = sorted.get(key);
                if (existing == null) {
                    existing = CardOperationData.builder()
                            .publicationDate(op.getPublicationDate())
                            .type(op.getType());
                    sorted.put(key, existing);
                }
                existing.cardIds(op.getCardIds());
                existing.cards(op.getCards());
            }
            resultMap.put(groupEntry.getKey(), sorted.entrySet().stream().map(e -> e.getValue().build()).collect(Collectors.toList()));

        }
        return resultMap;
    }

    /**
     * <p>Let the service handle AMQP backend notification of operation on a list of cards</p>
     * <p>The handling is asynchronous and is published to a backing {@link FluxSink}</p>
     *
     * @param cards cards to notify
     * @param type type of notification
     */
    public void notifyCards(Collection<CardPublicationData> cards, CardOperationTypeEnum type) {
        cards.forEach(c -> sink.next(Tuples.of(c, type)));
    }

    /**
     * <p>Arrange {@link Card} into Unitary {@link CardOperationData} builder, that is to say
     * CardOperationDataBuilder that only contain
     * one card</p>
     * <p>For one card:
     * <ul>
     * <li>the first resulting map contains association from a concerned group string key to an unitary</li>
     * <li>the second resulting map contains association from a concerned orphaned user (a user concerned by a card
     * but not belonging to any concerned group) string key to an unitary</li>
     * </ul>
     * </p>
     * <p>
     * NB: At this point it may seems weird to "return" maps as these maps only contains one elemnt but it allows
     * for simpler data manipulation during later reduce operation to fuse {@link CardOperationData} builder
     * </p>
     * {@link Card}²
     *
     * @param card the card to be afterward notified
     * @param type the type of notification
     * @return a tuple of two maps
     */
    private Tuple2<Map<String, CardOperationData.BuilderEncapsulator>, Map<String, CardOperationData.BuilderEncapsulator>> arrangeUnitaryCardOperation(CardPublicationData card, CardOperationTypeEnum type) {
        Map<String, CardOperationData.BuilderEncapsulator> groupCardsDictionnay = new HashMap<>();
        Map<String, CardOperationData.BuilderEncapsulator> userCardsDictionnary = new HashMap<>();

        StringBuilder groupSB = new StringBuilder();
        int currentSize = 0;
        for (String g : card.getGroupRecipients()) {
            if (currentSize + g.getBytes().length > 200) {
                addCardToOperation(card, type, groupCardsDictionnay, groupSB.toString());
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
            addCardToOperation(card, type, groupCardsDictionnay, groupSB.toString());
        }

        for (String u : card.getOrphanedUsers()) {
            addCardToOperation(card, type, userCardsDictionnary, u);
        }

        return Tuples.of(groupCardsDictionnay, userCardsDictionnary);
    }

    /**
     * Effective notification to the specified exchange, the map key is used as key binding
     *
     * @param operationDictionnary
     * @param exchange
     */
    private void sendOperation(Map<String, List<CardOperation>> operationDictionnary, Exchange
            exchange) {
        operationDictionnary.entrySet().stream().
                forEach(entry ->
                        entry.getValue().forEach(op -> {
                            try {
                                rabbitTemplate.convertAndSend(
                                        exchange.getName(),
                                        entry.getKey(),
                                        mapper.writeValueAsString(op)
                                );
                                log.info("Operation sent to Exchange[" + exchange.getName() + "] with routing key " + entry.getKey
                                        ());
                            } catch (JsonProcessingException e) {
                                log.error("Unnable to linearize card to json on amqp notification");
                            }
                        })
                );
    }

    /**
     * turn {@link CardPublicationData} + type into a {@link CardOperationData.BuilderEncapsulator} and associated
     * it to a builder id (~= group name or user name)
     *
     * @param c
     * @param type
     * @param cardsDictionnay
     * @param builderId
     */
    private void addCardToOperation(CardPublicationData c,
                                    CardOperationTypeEnum type, Map<String, CardOperationData.BuilderEncapsulator> cardsDictionnay,
                                    String builderId) {
        CardOperationData.BuilderEncapsulator builderEncapsulator = cardsDictionnay.get(builderId);
        if (builderEncapsulator == null) {
            builderEncapsulator = CardOperationData.encapsulatedBuilder();
            builderEncapsulator.builder().type(type).publicationDate(c.getPublishDate());
            cardsDictionnay.put(builderId, builderEncapsulator);
        }
        switch (type) {
            case ADD:
            case UPDATE:
                builderEncapsulator.builder().card(c.toLightCard());
                break;
            case DELETE:
                builderEncapsulator.builder().cardId(c.getId());

        }
    }
}
