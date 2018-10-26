/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
 * <p></p>
 * Created on 27/09/18
 *
 * @author davibind
 */
@Slf4j
@EqualsAndHashCode
public class CardSubscription {
    public static final String GROUPS_SUFFIX = "Groups";
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
        this.groupMlc = createMessageListenerContainer(this.login+ GROUPS_SUFFIX);
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
        log.info(String.format("CREATE User[%s] queue",this.login));
        Queue queue = QueueBuilder.nonDurable(this.login).build();
        amqpAdmin.declareQueue(queue);
        Binding binding = BindingBuilder
           .bind(queue)
           .to(this.userExchange)
           .with(this.login);
        amqpAdmin.declareBinding(binding);
        log.info(String.format("CREATED User[%s] queue",this.login));
        return queue;
    }

    private Queue createTopicQueue() {
        log.info(String.format("CREATE Group[%sGroups] queue",this.login));
        Queue queue = QueueBuilder.nonDurable(this.login+ GROUPS_SUFFIX).build();
        amqpAdmin.declareQueue(queue);
        groups.stream().map(g -> "#." + g + ".#").forEach(g -> {
            Binding binding = BindingBuilder.bind(queue).to(groupExchange).with(g);
            amqpAdmin.declareBinding(binding);
        });
        log.info(String.format("CREATED Group[%sGroups] queue with bindings :",this.login));
        log.info(String.format("CREATED Group[%sGroups] queue with bindings :",this.login));
        groups.stream().map(g -> "#." + g + ".#").forEach(g -> {
           log.info("\t* "+g);
        });
        return queue;
    }

    public void clearSubscription() {
        log.info(String.format("STOPPING User[%s] queue",this.login));
        this.userMlc.stop();
        amqpAdmin.deleteQueue(this.login);
        log.info(String.format("STOPPING Group[%sGroups] queue",this.login));
        this.groupMlc.stop();
        amqpAdmin.deleteQueue(this.login+ GROUPS_SUFFIX);
    }

    public MessageListenerContainer createMessageListenerContainer(String queueName) {

        SimpleMessageListenerContainer mlc = new SimpleMessageListenerContainer(connectionFactory);
        mlc.addQueueNames(queueName);
        mlc.setAcknowledgeMode(AcknowledgeMode.AUTO);

        return mlc;
    }

}
