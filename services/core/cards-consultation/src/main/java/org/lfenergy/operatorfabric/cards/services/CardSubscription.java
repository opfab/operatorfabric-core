/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.services;

import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.model.CardOperationData;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.listener.MessageListenerContainer;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;

import java.time.Duration;
import java.util.HashSet;
import java.util.Set;

/**
 * <p></p>
 * Created on 27/09/18
 *
 * @author davibind
 */
@Slf4j
@EqualsAndHashCode
public class CardSubscription {
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

    @Builder
    public CardSubscription(User user,
                            String clientId,
                            Runnable doOnCancel,
                            AmqpAdmin amqpAdmin,
                            DirectExchange userExchange,
                            TopicExchange groupExchange,
                            ConnectionFactory connectionFactory) {
        this.id = computeSubscriptionId(user, clientId);
        this.login = user.getLogin();
        this.groups = new HashSet<>(user.getGroups());
        this.amqpAdmin = amqpAdmin;
        this.userExchange = userExchange;
        this.groupExchange = groupExchange;
        this.connectionFactory = connectionFactory;
        initSubscription(doOnCancel);
    }

    public static String computeSubscriptionId(User user, String clientId) {
        return user.getLogin() + "#" + clientId;
    }

    private void initSubscription(Runnable doOnCancel) {
        createUserQueue();
        createTopicQueue();
        this.userMlc = createMessageListenerContainer(this.login);
        this.groupMlc = createMessageListenerContainer(this.login+"Groups");
        publisher = Flux.create(emitter -> {
            registerListener(userMlc, emitter,this.login);
            registerListener(groupMlc, emitter,this.login+"Groups");
            emitter.onRequest(v -> {
                log.info("STARTING subscription");
                log.info("LISTENING to messages on User["+this.login+"] queue");
                userMlc.start();
                log.info("LISTENING to messages on Group["+this.login+"Groups] queue");
                groupMlc.start();
            });
            emitter.onDispose(()->doOnCancel.run());
        });
        publisher = publisher.doOnError(t->log.error("Unexpected error",t));

    }

    private void registerListener(MessageListenerContainer userMlc, FluxSink<String> emitter, String queueName) {
        userMlc.setupMessageListener((MessageListener) message -> {
            //TODO change this to keep the subscription up before definitive eviction
//            if (emitter.isCancelled()) {
////                userMlc.stop();
//                return;
//            }
            log.info("PUBLISHING message from "+queueName);
            emitter.next(new String(message.getBody()));

        });
    }

    private Queue createUserQueue() {
        log.info("CREATE User["+this.login+"] queue");
        Queue queue = QueueBuilder.nonDurable(this.login).build();
        amqpAdmin.declareQueue(queue);
        Binding binding = BindingBuilder
           .bind(queue)
           .to(this.userExchange)
           .with(this.login);
        amqpAdmin.declareBinding(binding);
        log.info("CREATED User["+this.login+"] queue");
        return queue;
    }

    private Queue createTopicQueue() {
        log.info("CREATE Group["+this.login+"Groups] queue");
        Queue queue = QueueBuilder.nonDurable(this.login+"Groups").build();
        amqpAdmin.declareQueue(queue);
        groups.stream().map(g -> "#." + g + ".#").forEach(g -> {
            Binding binding = BindingBuilder.bind(queue).to(groupExchange).with(g);
            amqpAdmin.declareBinding(binding);
        });
        log.info("CREATED Group["+this.login+"Groups] queue with bindings :");
        log.info("CREATED Group["+this.login+"Groups] queue with bindings :");
        groups.stream().map(g -> "#." + g + ".#").forEach(g -> {
           log.info("\t* "+g);
        });
        return queue;
    }

    public void clearSubscription() {
        log.info("STOPPING User["+this.login+"] queue");
        this.userMlc.stop();
        amqpAdmin.deleteQueue(this.login);
        log.info("STOPPING Group["+this.login+"Groups] queue");
        this.groupMlc.stop();
        amqpAdmin.deleteQueue(this.login+"Groups");
    }

    public MessageListenerContainer createMessageListenerContainer(String queueName) {

        SimpleMessageListenerContainer mlc = new SimpleMessageListenerContainer(connectionFactory);
        mlc.addQueueNames(queueName);
        mlc.setAcknowledgeMode(AcknowledgeMode.AUTO);

        return mlc;
    }

}
