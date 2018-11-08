/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.services;

import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.listener.MessageListenerContainer;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;

import java.util.HashSet;
import java.util.Set;

/**
 * <p>This object manages subscription to AMQQ exchange</p>
 *
 * <p>Two exchanges are used, {@link #groupExchange} and {@link #userExchange}.
 * See amqp.xml resource file ([project]/services/core/cards-publication/src/main/resources/amqp.xml)
 * for their exact configuration</p>
 *
 * @author David Binder
 */
@Slf4j
@EqualsAndHashCode
public class CardSubscription {
    public static final String GROUPS_SUFFIX = "Groups";
    private final String userQueueName;
    private final String groupQueueName;
    private long current = 0;
    private String login;
    @Getter
    private String id;
    private Set<String> groups;
    @Getter
    private Flux<String> publisher;
    private AmqpAdmin amqpAdmin;
    private DirectExchange userExchange;
    private TopicExchange groupExchange;
    private ConnectionFactory connectionFactory;
    private MessageListenerContainer userMlc;
    private MessageListenerContainer groupMlc;
    @Getter
    private boolean cleared = false;
    private final String clientId;

    /**
     * Constructs a card subscription and init access to AMQP exchanges
     * @param user
     * @param clientId
     * @param doOnCancel
     * @param amqpAdmin
     * @param userExchange
     * @param groupExchange
     * @param connectionFactory
     */
    @Builder
    public CardSubscription(User user,
                            String clientId,
                            Runnable doOnCancel,
                            AmqpAdmin amqpAdmin,
                            DirectExchange userExchange,
                            TopicExchange groupExchange,
                            ConnectionFactory connectionFactory) {
        this.id = computeSubscriptionId(user.getLogin(), clientId);
        this.login = user.getLogin();
        this.groups = new HashSet<>(user.getGroups());
        this.amqpAdmin = amqpAdmin;
        this.userExchange = userExchange;
        this.groupExchange = groupExchange;
        this.connectionFactory = connectionFactory;
        this.clientId = clientId;
        this.userQueueName = computeSubscriptionId(this.login,this.clientId);
        this.groupQueueName = computeSubscriptionId(this.login+ GROUPS_SUFFIX,this.clientId);
        initSubscription(doOnCancel);
    }

    public static String computeSubscriptionId(String prefix, String clientId) {
        return prefix + "#" + clientId;
    }

    /**
     * <p>
     * <ul>
     * <li>Create a user queue and a group topic queue</li>
     * <li>Associate queues to message {@link MessageListenerContainer}.</li>
     * <li>Creates a publisher {@link Flux} to publish AMQP messages to</li>
     * </ul>
     * </p>
     * <p>
     * Listeners starts on {@link Flux} subscription.
     * </p>
     * <p>On subscription cancellation triggers doOnCancel</p>
     * @param doOnCancel
     */
    private void initSubscription(Runnable doOnCancel) {
        createUserQueue();
        createTopicQueue();
        this.userMlc = createMessageListenerContainer(this.userQueueName);
        this.groupMlc = createMessageListenerContainer(groupQueueName);
        publisher = Flux.create(emitter -> {
            registerListener(userMlc, emitter,this.login);
            registerListener(groupMlc, emitter,this.login+ GROUPS_SUFFIX);
            emitter.onRequest(v -> {
                log.info("STARTING subscription");
                log.info(String.format("LISTENING to messages on User[%s] queue",this.login));
                userMlc.start();
                log.info(String.format("LISTENING to messages on Group[%sGroups] queue",this.login));
                groupMlc.start();
            });
            emitter.onDispose(doOnCancel::run);
        });
        publisher = publisher.doOnError(t->log.error("Unexpected error",t));

    }

    /**
     * creates a message listener which publishes messages to {@link FluxSink}
     *
     * @param userMlc
     * @param emitter
     * @param queueName
     */
    private void registerListener(MessageListenerContainer userMlc, FluxSink<String> emitter, String queueName) {
        userMlc.setupMessageListener((MessageListener) message -> {
            log.info("PUBLISHING message from "+queueName);
            emitter.next(new String(message.getBody()));

        });
    }

    /**
     * Constructs a non durable queue to userExchange using user login as binding, queue name
     * is [user login]#[client id]
     * @return
     */
    private Queue createUserQueue() {
        log.info(String.format("CREATE User[%s] queue",this.login));
        Queue queue = QueueBuilder.nonDurable(this.userQueueName).build();
        amqpAdmin.declareQueue(queue);
        Binding binding = BindingBuilder
           .bind(queue)
           .to(this.userExchange)
           .with(this.login);
        amqpAdmin.declareBinding(binding);
        log.info(String.format("CREATED User[%s] queue",this.userQueueName));
        return queue;
    }

    /**
     * <p>Constructs a non durable queue to groupExchange using queue name
     * [user login]Groups#[client id].</p>
     * <p>Generates a binding for each group using pattern: #.[group].#</p>
     * @return
     */
    private Queue createTopicQueue() {
        log.info(String.format("CREATE Group[%sGroups] queue",this.login));
        Queue queue = QueueBuilder.nonDurable(this.groupQueueName).build();
        amqpAdmin.declareQueue(queue);
        groups.stream().map(g -> "#." + g + ".#").forEach(g -> {
            Binding binding = BindingBuilder.bind(queue).to(groupExchange).with(g);
            amqpAdmin.declareBinding(binding);
        });
        log.info(String.format("CREATED Group[%sGroups] queue with bindings :",this.groupQueueName));
        groups.stream().map(g -> "#." + g + ".#").forEach(g -> log.info("\t* "+g));
        return queue;
    }

    /**
     * Stops associated {@link MessageListenerContainer} and delete queues
     */
    public void clearSubscription() {
        log.info(String.format("STOPPING User[%s] queue",this.userQueueName));
        this.userMlc.stop();
        amqpAdmin.deleteQueue(this.userQueueName);
        log.info(String.format("STOPPING Group[%sGroups] queue",this.groupQueueName));
        this.groupMlc.stop();
        amqpAdmin.deleteQueue(this.groupQueueName);
        this.cleared = true;
    }

    /**
     *
     * @return true if associated AMQP listeners are still running
     */
    public boolean checkActive(){
        boolean userActive = userMlc == null || userMlc.isRunning();
        boolean groupActive = groupMlc == null || groupMlc.isRunning();
        return userActive && groupActive;
    }


    /**
     * Create a {@link MessageListenerContainer} for the specified queue
     * @param queueName
     * @return
     */
    public MessageListenerContainer createMessageListenerContainer(String queueName) {

        SimpleMessageListenerContainer mlc = new SimpleMessageListenerContainer(connectionFactory);
        mlc.addQueueNames(queueName);
        mlc.setAcknowledgeMode(AcknowledgeMode.AUTO);

        return mlc;
    }

}
