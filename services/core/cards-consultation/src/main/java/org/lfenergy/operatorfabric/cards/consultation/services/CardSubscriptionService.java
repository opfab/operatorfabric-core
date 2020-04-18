/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.consultation.services;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.amqp.core.AmqpAdmin;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

/**
 * <p>Centralize request for generating {@link CardSubscription} and deleting them.</p>
 *
 * <p>Uses a {@link ThreadPoolTaskScheduler} delay definitive deletion of subscription (defaults to 10s)</p>
 *
 *
 */
@Service
@Slf4j
public class CardSubscriptionService {

    private final ThreadPoolTaskScheduler taskScheduler;
    private final FanoutExchange groupExchange;
    private final DirectExchange userExchange;
    private final AmqpAdmin amqpAdmin;
    private final long deletionDelay;
    private final ConnectionFactory connectionFactory;
    private Map<String, CardSubscription> cache = new ConcurrentHashMap<>();
    private Map<String, ScheduledFuture<?>> pendingEvict = new ConcurrentHashMap<>();

    @Autowired
    public CardSubscriptionService(ThreadPoolTaskScheduler taskScheduler,
                                   FanoutExchange groupExchange,
                                   DirectExchange userExchange,
                                   ConnectionFactory connectionFactory,
                                   AmqpAdmin amqpAdmin,
                                   @Value("${opfab.subscriptiondeletion.delay:10000}")
                                      long deletionDelay) {
        this.groupExchange = groupExchange;
        this.userExchange = userExchange;
        this.taskScheduler = taskScheduler;
        this.amqpAdmin = amqpAdmin;
        this.connectionFactory = connectionFactory;
        this.deletionDelay = deletionDelay;
    }

    /**
     * <p>Generates a {@link CardSubscription} or retrieve it from a local {@link CardSubscription} cache.</p>
     * <p>If it finds a {@link CardSubscription} from cache, it will try to cancel possible scheduled evict</p>
     *
     * @param user
     *    connected user
     * @param clientId
     *    client unique id (generated by ui)
     * @param rangeStart
     *    notification filtering start
     * @param rangeEnd
     *    notification filtering end
     * @param filterNotification
     *    filter notification on range start and end (Not implemented)
     * @return the CardSubscription object which controls publisher instantiation
     */
    public synchronized CardSubscription subscribe(
            User user,
            String clientId,
            Instant rangeStart,
            Instant rangeEnd,
            boolean filterNotification) {
        String subId = CardSubscription.computeSubscriptionId(user.getLogin(), clientId);
        CardSubscription cardSubscription = cache.get(subId);
        // The builder may seem declare a bit to early but it allows usage in both branch of the later condition
        CardSubscription.CardSubscriptionBuilder cardSubscriptionBuilder = CardSubscription.builder()
           .user(user)
           .clientId(clientId)
           .amqpAdmin(amqpAdmin)
           .userExchange(this.userExchange)
           .groupExchange(this.groupExchange)
           .connectionFactory(this.connectionFactory)
           .rangeStart(rangeStart)
           .rangeEnd(rangeEnd)
           .filterNotification(filterNotification);
        if (cardSubscription == null) {
            cardSubscription = buildSubscription(subId, cardSubscriptionBuilder);
        } else {
            if (!cancelEviction(subId)) {
                cardSubscription = cache.get(subId);
                if (cardSubscription == null) {
                    cardSubscription = buildSubscription(subId, cardSubscriptionBuilder);
                }
            }
        }
        return cardSubscription;
    }

    private CardSubscription buildSubscription(String subId, CardSubscription.CardSubscriptionBuilder cardSubscriptionBuilder) {
        CardSubscription cardSubscription;
        cardSubscription = cardSubscriptionBuilder.build();
        cardSubscription.initSubscription(() -> scheduleEviction(subId));
        cache.put(subId, cardSubscription);
        log.info("Subscription created for  {}", cardSubscription.getId());
        return cardSubscription;
    }

    /**
     * Schedule deletion of subscription in deletionDelay millis
     *
     * @param subId
     *    Subscription computed id
     */
    public void scheduleEviction(String subId) {
        if (!pendingEvict.containsKey(subId)) {
            ScheduledFuture<?> scheduled = taskScheduler.schedule(createEvictTask(subId),
               new Date(System.currentTimeMillis() + deletionDelay));
            pendingEvict.put(subId, scheduled);
            log.info("Eviction scheduled for  {}", subId);
        }
    }

    /**
     * Cancel scheduled evict if any
     *
     * @param subId
     *    subscription autogenerated id
     * @return true if eviction was successfuly cancelled, false may indicate that either no cancellation was
     * possible or no eviction was previously scheduled
     */
    public synchronized boolean cancelEviction(String subId) {
        ScheduledFuture<?> scheduled = pendingEvict.get(subId);
        if (scheduled != null) {
            boolean canceled = scheduled.cancel(false);
            pendingEvict.remove(subId);
            log.info("Eviction canceled for  {}", subId);
            return canceled;
        }
        return false;
    }

    /**
     * Evict subscription definitively
     *
     * @param subId subscription unique id
     *    subscription autogenerated id
     */
    public synchronized void evict(String subId) {
        log.info("Trying to evic subscription for  {}", subId);
        cache.get(subId).clearSubscription();
        cache.remove(subId);
        pendingEvict.remove(subId);
        log.warn("Subscription evicted for  {}", subId);
    }

    /**
     * Create a runnable to to launch {@link #evict(String)}
     *
     * @param subId
     *    subscription autogenerated id
     * @return the generated task
     */
    private Runnable createEvictTask(String subId) {
        return () -> evict(subId);
    }

    /**
     * <p>Find existing subscription</p>
     * <p>NB: May throw {@link IllegalStateException} if any of the parameters is missing</p>
     * @param user Users whom subsciption we search
     * @param uiId Unique client id whom subsciption we search
     * @return
     */
    public CardSubscription findSubscription(User user,String uiId) {
        if(user == null)
            throw new IllegalArgumentException("user is a mandatory parameter of CardSubscriptionService#findSubscription");
        if(uiId == null)
            throw new IllegalArgumentException("uiId is a mandatory parameter of CardSubscriptionService#findSubscription");
        String subId = CardSubscription.computeSubscriptionId(user.getLogin(), uiId);
        return cache.get(subId);
    }

    public void clearSubscriptions() {
        this.cache.forEach((k,v)->v.clearSubscription());
        this.cache.clear();
        this.pendingEvict.clear();
    }
}
