package org.lfenergy.operatorfabric.cards.consultation.services;

import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.awaitility.core.ConditionTimeoutException;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.consultation.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import reactor.test.StepVerifier;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.awaitility.Awaitility.await;

/**
 * <p></p>
 * Created on 29/10/18
 *
 * @author davibind
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {IntegrationTestApplication.class,CardSubscriptionService.class})
@Slf4j
@ActiveProfiles("test")
@Tag("end-to-end")
@Tag("amqp")
public class CardSubscriptionServiceShould {

    private static String TEST_ID = "testClient";

    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Autowired
    private TopicExchange groupExchange;
    @Autowired
    private DirectExchange userExchange;
    @Autowired
    private CardSubscriptionService service;
    @Autowired
    private ThreadPoolTaskScheduler taskScheduler;

    private User user;

    public CardSubscriptionServiceShould(){
        user = new User();
        user.setLogin("testuser");
        user.setFirstName("Test");
        user.setLastName("User");
        List<String> groups = new ArrayList<>();
        groups.add("testgroup1");
        groups.add("testgroup2");
        user.setGroups(groups);
    }

    @Test
    public void createAndDeleteSubscription(){
        CardSubscription subscription = service.subscribe(user, TEST_ID);
        subscription.getPublisher().subscribe(log::info);
        Assertions.assertThat(subscription.checkActive()).isTrue();
        service.evict(subscription.getId());
        Assertions.assertThat(subscription.isCleared()).isTrue();
        Assertions.assertThat(subscription.checkActive()).isFalse();
//        await().atMost(10, TimeUnit.SECONDS).until(() -> !subscription.checkActive());
    }

    @Test
    public void deleteSubscriptionWithDelay(){
        CardSubscription subscription = service.subscribe(user, TEST_ID);
        subscription.getPublisher().subscribe(log::info);
        Assertions.assertThat(subscription.checkActive()).isTrue();
        service.scheduleEviction(subscription.getId());
        Assertions.assertThat(subscription.checkActive()).isTrue();
        Assertions.assertThat(subscription.isCleared()).isFalse();
        await().atMost(15, TimeUnit.SECONDS).until(() -> !subscription.checkActive() && subscription.isCleared());
    }

    @Test
    public void reviveSubscription(){
        CardSubscription subscription = service.subscribe(user, TEST_ID);
        subscription.getPublisher().subscribe(log::info);
        Assertions.assertThat(subscription.checkActive()).isTrue();
        service.scheduleEviction(subscription.getId());
        Assertions.assertThat(subscription.checkActive()).isTrue();
        try {
            await().atMost(6, TimeUnit.SECONDS).until(() -> !subscription.checkActive() && subscription.isCleared());
            Assertions.assertThat(false).isFalse().describedAs("An exception was expected here");
        }catch (ConditionTimeoutException e){
            //nothing, everything is alright
        }
        CardSubscription subscription2 = service.subscribe(user, TEST_ID);
        Assertions.assertThat(subscription2).isSameAs(subscription);
        try {
            await().atMost(6, TimeUnit.SECONDS).until(() -> !subscription.checkActive() && subscription.isCleared());
            Assertions.assertThat(false).isFalse().describedAs("An exception was expected here");
        }catch (ConditionTimeoutException e){
            //nothing, everything is alright
        }
        service.evict(subscription.getId());
        Assertions.assertThat(subscription.isCleared()).isTrue();
        Assertions.assertThat(subscription.checkActive()).isFalse();
    }

    @Test
    public void receiveCards(){
        CardSubscription subscription = service.subscribe(user, TEST_ID);
        StepVerifier.FirstStep<String> verifier = StepVerifier.create(subscription.getPublisher());
        taskScheduler.schedule(createSendMessageTask(),new Date(System.currentTimeMillis() + 1000));
        verifier
           .expectNext("test message 1")
           .expectNext("test message 2")
           .thenCancel()
           .verify();
    }

    private Runnable createSendMessageTask() {
        return () ->{
            rabbitTemplate.convertAndSend(userExchange.getName(),user.getLogin(),"test message 1");
            rabbitTemplate.convertAndSend(userExchange.getName(),user.getLogin(),"test message 2");
        };
    }
}