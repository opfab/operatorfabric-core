/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.consultation.model.CardOperationConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.model.I18nConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.model.LightCardConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.repositories.CardRepository;
import org.lfenergy.operatorfabric.cards.consultation.services.CardSubscription;
import org.lfenergy.operatorfabric.cards.consultation.services.CardSubscriptionService;
import org.lfenergy.operatorfabric.cards.model.CardOperationTypeEnum;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.lfenergy.operatorfabric.users.model.User;
import org.lfenergy.operatorfabric.utilities.VirtualTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * <p>Handles cards access at the rest level. Depends on {@link CardSubscriptionService} for business logic</p>
 *
 * @author David Binder
 */
@Component
@Slf4j
public class CardOperationsController {

    private final CardSubscriptionService cardSubscriptionService;

    private final CardRepository cardRepository;

    private final ObjectMapper mapper;

    @Autowired
    public CardOperationsController(CardSubscriptionService cardSubscriptionService, ObjectMapper mapper, CardRepository cardRepository) {
        this.cardSubscriptionService = cardSubscriptionService;
        this.mapper = mapper;
        this.cardRepository = cardRepository;
    }


    /**
     * Registers to {@link CardSubscriptionService} to get access to a {@link Flux} of String. Those strings are Json
     * {@link org.lfenergy.operatorfabric.cards.consultation.model.CardOperation} representation
     *
     * @param input
     *    o tuple containing 1) user data 2) client id
     * @return mesage publisher
     */
    public Flux<String> registerSubscriptionAndPublish(Mono<CardOperationsGetParameters> input) {
        return input
           .flatMapMany(t -> {
               if (t.getClientId()!=null) {
                   //init subscription if needed
                   CardSubscription subscription = null;
                   if(t.isNotification()) {
                       subscription = cardSubscriptionService.subscribe(t.getUser(), t.getClientId());
                   }
                   // fetch old card (if needed, see {@]link #fetchOldCards} method)
                   Flux<String> oldCards = fetchOldCards(t, subscription == null ? null : subscription.getStartingPublishDate());
                   //merge subscription and old cards as needed
                   if(subscription!=null)
                       return ((Flux<String>) subscription.getPublisher()).mergeWith(oldCards);
                   else
                       return oldCards;
               } else {
                   log.warn("\"clientId\" is a mandatory request parameter");
                   ApiErrorException e = new ApiErrorException(ApiError.builder()
                      .status(HttpStatus.BAD_REQUEST)
                      .message("\"clientId\" is a mandatory request parameter")
                      .build()
                   );
                   log.debug("4xx error underlying exception", e);
                   return Mono.just(objectToJsonString(e.getError()));
               }
           });
    }

    private Flux<String> fetchOldCards(CardOperationsGetParameters parameters, Long referencePublishDate) {
        Flux<String> oldCards;
        Long start = parameters.getRangeStart();
        Long end = parameters.getRangeEnd();
        if(end != null && start !=null) {
            referencePublishDate = referencePublishDate == null ? VirtualTime.getInstance().computeNow().toEpochMilli() : referencePublishDate;
            User user = parameters.getUser();
            String login = user.getLogin();
            String[] groups = user.getGroups().toArray(new String[user.getGroups().size()]);
            oldCards = cardRepository.findUrgentJSON(referencePublishDate, start, end, login, groups);
        }else{
            oldCards = Flux.empty();
        }
        return oldCards;
    }

    /**
     * Generates a test {@link Flux} of String. Those strings are Json
     * {@link org.lfenergy.operatorfabric.cards.consultation.model.CardOperation} representation
     *
     * @param input
     *    o tuple containing 1) user data 2) client id
     * @return message publisher
     */
    public Flux<String> publishTestData(Mono<CardOperationsGetParameters> input) {
        return input.flatMapMany(t -> Flux
           .interval(Duration.ofSeconds(5))
           .doOnEach(l -> log.info("message " + l + " to " + t.getUser().getLogin()))
           .map(l -> CardOperationConsultationData.builder()
              .number(l)
              .publishDate(VirtualTime.getInstance().computeNow().toEpochMilli() - 600000)
              .type(CardOperationTypeEnum.ADD)
              .card(
                 LightCardConsultationData.builder()
                    .id(l + "")
                    .uid(l + "")
                    .summary(I18nConsultationData.builder().key("summary").build())
                    .title(I18nConsultationData.builder().key("title").build())
                    .mainRecipient("rte-operator")
                    .severity(SeverityEnum.ALARM)
                    .startDate(VirtualTime.getInstance().computeNow().toEpochMilli())
                    .endDate(VirtualTime.getInstance().computeNow().toEpochMilli() + 3600000)
                    .build()
              )
              .build())
           .map(this::objectToJsonString)
           .doOnCancel(() -> log.info("cancelled"))
           .log()
        );
    }

    /**
     * Converts an object to a JSON string. If conversion problems arise, logs and returns "null" string
     *
     * @param o
     *    an object
     * @return Json object string representation or "null" if error.
     */
    private String objectToJsonString(Object o) {
        try {
            return mapper.writeValueAsString(o);
        } catch (JsonProcessingException e) {
            log.error("Unable to convert object to Json string", e);
            return "null";
        }
    }


}
