/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.consultation.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.consultation.model.CardOperationData;
import org.lfenergy.operatorfabric.cards.consultation.model.I18nData;
import org.lfenergy.operatorfabric.cards.consultation.model.LightCardData;
import org.lfenergy.operatorfabric.cards.consultation.services.CardSubscriptionService;
import org.lfenergy.operatorfabric.cards.model.CardOperationTypeEnum;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.lfenergy.operatorfabric.springtools.config.oauth.OpFabJwtAuthenticationToken;
import org.lfenergy.operatorfabric.users.model.User;
import org.lfenergy.operatorfabric.utilities.SimulatedTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.server.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.security.Principal;
import java.time.Duration;

/**
 * <p></p>
 * Created on 18/09/18
 *
 * @author davibind
 */
@RestController
@Component
@Slf4j
public class CardOperationsController {

    private final CardSubscriptionService cardSubscriptionService;


    private final ObjectMapper mapper;

    @Autowired
    public CardOperationsController(CardSubscriptionService cardSubscriptionService, ObjectMapper mapper){
        this.cardSubscriptionService = cardSubscriptionService;
        this.mapper = mapper;
    }

    @Bean
    public RouterFunction<ServerResponse> cardOperationRoutes(){
        return RouterFunctions.route(RequestPredicates.GET("/cardOperations"),
           request-> {
               ServerResponse.BodyBuilder builder = ServerResponse.ok()
                  .contentType(MediaType.TEXT_EVENT_STREAM);
               if(request.queryParam("test").orElse("false").equals("true")){
                   return builder.body(test(request.principal()),String.class);
               }else {
                  return builder.body(request.principal().flatMapMany(principal -> subscribeToCardOperations(request,
                     principal)),
                      String.class);
               }
           }
              );
    }

    private Flux<String> subscribeToCardOperations(ServerRequest req, Principal principal) {
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        User user = (User) jwtPrincipal.getPrincipal();
        String clientId = req.queryParam("clientId").get();
        return cardSubscriptionService.subscribe(user, clientId).getPublisher();
    }

    private Flux<String> test(Mono<? extends Principal> user){
        return user.flatMapMany(u->Flux
           .interval(Duration.ofSeconds(5))
           .doOnEach(l->log.info("message "+l+" to "+ u.getName()))
           .map(l->CardOperationData.builder()
              .number(l)
              .publicationDate(SimulatedTime.getInstance().computeNow().toEpochMilli()-600000)
              .type(CardOperationTypeEnum.ADD)
              .card(
                 LightCardData.builder()
                    .id(l+"")
                    .uid(l+"")
                    .summary(I18nData.builder().key("summary").build())
                    .title(I18nData.builder().key("title").build())
                    .mainRecipient("rte-operator")
                    .severity(SeverityEnum.ALARM)
                    .startDate(SimulatedTime.getInstance().computeNow().toEpochMilli())
                    .endDate(SimulatedTime.getInstance().computeNow().toEpochMilli()+3600000)
                 .build()
              )
              .build())
           .map(o->{
               try {
                   return mapper.writeValueAsString(o);
               }catch (JsonProcessingException e){
                   log.error("Unnable to convert object to Json string",e);
                   return "null";
               }
           })
           .doOnCancel(()->log.info("cancelled"))
           .log()
        );
    }


}
