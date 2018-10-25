/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.consultation.services;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.amqp.core.AmqpAdmin;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

/**
 * <p></p>
 * Created on 27/09/18
 *
 * @author davibind
 */
@Service
@Slf4j
public class CardSubscriptionService {

    private final ThreadPoolTaskScheduler taskScheduler;
    private final TopicExchange groupExchange;
    private final DirectExchange userExchange;
    private final AmqpAdmin amqpAdmin;
    private final ConnectionFactory connectionFactory;
    //TODO maybe a CardSubscription rolling cache to manage reconnect
    private Map<String,CardSubscription> cache = new ConcurrentHashMap<>();
    private Map<String,ScheduledFuture<?>> pendingEvict = new ConcurrentHashMap<>();

    @Autowired
    public CardSubscriptionService(ThreadPoolTaskScheduler taskScheduler,
                                   TopicExchange groupExchange,
                                   DirectExchange userExchange,
                                   ConnectionFactory connectionFactory,
                                   AmqpAdmin amqpAdmin){
        this.groupExchange = groupExchange;
        this.userExchange = userExchange;
        this.taskScheduler = taskScheduler;
        this.amqpAdmin = amqpAdmin;
        this.connectionFactory = connectionFactory;
    }

    public synchronized CardSubscription subscribe(User user, String clientId){
        String subId = CardSubscription.computeSubscriptionId(user, clientId);
        CardSubscription cardSubscription = cache.get(subId);
        CardSubscription.CardSubscriptionBuilder cardSubscriptionBuilder = CardSubscription.builder()
           .user(user)
           .clientId(clientId)
           .amqpAdmin(amqpAdmin)
           .userExchange(this.userExchange)
           .groupExchange(this.groupExchange)
           .connectionFactory(this.connectionFactory)
           .doOnCancel(() -> scheduleEvict(subId));
        if(cardSubscription == null) {
            cardSubscription = cardSubscriptionBuilder
               .build();
            cache.put(subId, cardSubscription);
            log.info("Subscription created for "+cardSubscription.getId());
        }else{
            if(!cancelEvict(subId)){
                cardSubscription = cache.get(subId);
                if(cardSubscription == null) {
                    cardSubscription = cardSubscriptionBuilder.build();
                    cache.put(subId, cardSubscription);
                    log.info("Subscription created for "+cardSubscription.getId());
                }
            }
        }
        return cardSubscription;
    }

    public void scheduleEvict(String subId){
        if(!pendingEvict.containsKey(subId)) {
            ScheduledFuture<?> scheduled = taskScheduler.schedule(createEvictTask(subId),
               new Date(System.currentTimeMillis() + 10000));
            pendingEvict.put(subId,scheduled);
            log.info("Eviction scheduled for "+subId);
        }
    }

    public synchronized boolean cancelEvict(String subId){
        ScheduledFuture<?> scheduled = pendingEvict.get(subId);
        if(scheduled!=null) {
            boolean canceled = scheduled.cancel(false);
            pendingEvict.remove(subId);
            log.info("Eviction canceled for "+subId);
            return canceled;
        }
        return false;
    }

    public synchronized void evict(String subId){
        log.info("Trying to evic subscription for "+subId);
        cache.get(subId).clearSubscription();
        cache.remove(subId);
        pendingEvict.remove(subId);
        log.warn("Subscription evicted for "+subId);
    }

    private Runnable createEvictTask(String subId){
        return ()->evict(subId);
    }
}
