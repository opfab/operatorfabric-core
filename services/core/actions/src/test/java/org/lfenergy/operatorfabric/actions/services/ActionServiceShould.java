/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.lfenergy.operatorfabric.actions.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.actions.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.actions.configuration.webflux.GlobalErrorAttributes;
import org.lfenergy.operatorfabric.actions.model.Action;
import org.lfenergy.operatorfabric.actions.model.ActionData;
import org.lfenergy.operatorfabric.actions.model.ActionStatusData;
import org.lfenergy.operatorfabric.actions.model.I18nData;
import org.lfenergy.operatorfabric.actions.services.clients.CardConsultationClient;
import org.lfenergy.operatorfabric.actions.services.clients.ThirdClient;
import org.lfenergy.operatorfabric.cards.model.Card;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.client.ExpectedCount;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.test.web.client.RequestMatcher;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.client.RestTemplate;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.net.URI;
import java.net.URISyntaxException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.lfenergy.operatorfabric.test.AssertUtils.assertException;
import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

@ExtendWith(SpringExtension.class)
@Slf4j
@ActiveProfiles("test")
@AutoConfigureWebTestClient
@WebFluxTest(ActionService.class)
@Import({GlobalErrorAttributes.class
        , RestTemplate.class
        , IntegrationTestApplication.class
})
public class ActionServiceShould {

    private static final String EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE = "http://somewhere:111/process/state/action?access_token=abc";
    public static final RequestMatcher EXPECTED_GET_METHOD = method(HttpMethod.GET);
    public static final String JWT_TOKEN_VALUE = "abc";
    public static final String WRONG_STATE = "foobar";

    @Autowired
    WebTestClient webTestClient;

    @Autowired
    RestTemplate restTemplate;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    ActionService actionService;

    @MockBean
    private CardConsultationClient cardConsultationClient;

    @MockBean
    private ThirdClient thirdClient;

    private Card card;
    private Action action;
    private MockRestServiceServer mockServer;

    private MockServerWebExchange mockWebServer;

    @BeforeEach
    public void init() {
        mockServer = MockRestServiceServer.createServer(restTemplate);
        card = new Card();
        card.setPublisher("publisher");
        card.setProcess("process");
        card.setProcessId("process-instance");
        card.setState("state");
        card.setData(new TestClass1());

        action = ActionData.builder()
                .url("http://somewhere:111/{process}/{state}/action?access_token={jwt}")
                .build();
    }

    @Test
    public void expectSomething() {
        assertThat(this.actionService.extractToken(card, "jwt", "token")).isEqualTo("token");
        assertThat(this.actionService.extractToken(card, "process", "token")).isEqualTo("process");
        assertThat(this.actionService.extractToken(card, "processInstance", "token")).isEqualTo("process-instance");
        assertThat(this.actionService.extractToken(card, "state", "token")).isEqualTo("state");
        assertThat(this.actionService.extractToken(card, "data.value1.value2", "token")).isEqualTo("value");
    }

    @Test
    void extractStringCardData() {
        assertThat(this.actionService.extractStringCardData(card, "data.value1.value2")).isEqualTo("value");
    }

    @Test
    void replaceToken() {
        assertThat(this.actionService.replaceTokens(this.action, this.card, JWT_TOKEN_VALUE))
                .isEqualTo(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE);
    }

    @Test
    void leaveUrlWithCurlyBracesUntouched() {
        String urlWithoutCurlyBraces = "http://url-of-test-without-curly-braces/need/to/stay/untouched";
        this.action = ActionData.builder()
                .url(urlWithoutCurlyBraces)
                .build();
        assertThat(this.actionService.replaceTokens(this.action, this.card, ""))
                .isEqualTo(urlWithoutCurlyBraces);
    }

    @Test
    void updateAction() throws URISyntaxException, JsonProcessingException {
        ActionStatusData actionStatus = buildDefaultActionStatus();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(EXPECTED_GET_METHOD)
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapActionStatus(actionStatus))
                );
        assertThat(this.actionService.updateAction(this.action, this.card, JWT_TOKEN_VALUE)).isEqualTo(actionStatus);
    }

    private ActionStatusData buildDefaultActionStatus() {
        return buildMinimalActionStatus("new.label");

    }

    private ActionStatusData buildMinimalActionStatus(String labelKey) {
        return ActionStatusData.builder()
                .label(I18nData.builder().key(labelKey).build())
                .build();
    }

    private String mapActionStatus(ActionStatusData actionStatus) throws JsonProcessingException {
        return objectMapper.writeValueAsString(actionStatus);
    }


    @Test
    void updateActionEmpty() throws URISyntaxException, JsonProcessingException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(EXPECTED_GET_METHOD)
                .andRespond(withStatus(HttpStatus.NO_CONTENT)
                        .contentType(MediaType.APPLICATION_JSON)
                );
        assertThat(this.actionService.updateAction(this.action, this.card, JWT_TOKEN_VALUE)).isNull();
    }

    @Test
    void updateAction404() throws URISyntaxException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(EXPECTED_GET_METHOD)
                .andRespond(withStatus(HttpStatus.NOT_FOUND)
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.updateAction(this.action, this.card, JWT_TOKEN_VALUE);
        }).withMessage(ActionService.REMOTE_404_MESSAGE);
    }

    @Test
    void updateAction503() throws URISyntaxException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(EXPECTED_GET_METHOD)
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE)
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.updateAction(this.action, this.card, JWT_TOKEN_VALUE);
        }).withMessage(ActionService.UNEXPECTED_REMOTE_3RD_MESSAGE);
    }

    @Test
    void sendAction() throws URISyntaxException, JsonProcessingException {
        ActionStatusData actionStatus = buildDefaultActionStatus();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapActionStatus(actionStatus))
                );
        assertThat(this.actionService.sendAction(this.action, this.card, JWT_TOKEN_VALUE, null)).isEqualTo(actionStatus);
    }

    @Test
    void sendAction404() throws URISyntaxException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.NOT_FOUND)
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.sendAction(this.action, this.card, JWT_TOKEN_VALUE, null);
        }).withMessage(ActionService.REMOTE_404_MESSAGE);
    }

    @Test
    void sendAction503() throws URISyntaxException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE)
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.sendAction(this.action, this.card, JWT_TOKEN_VALUE, null);
        }).withMessage(ActionService.UNEXPECTED_REMOTE_3RD_MESSAGE);
    }

    @Test
    void lookUpActionStatus() {
        Mockito.when(cardConsultationClient.fetchMonoCard(anyString(), anyString()))
                .thenReturn(Mono.just(card));
        ActionData returnedActionDataByThirdService = ActionData.builder()
                .label(I18nData.builder()
                        .key("new.label")
                        .build())
                .build();
        Mockito.when(thirdClient.fetchMonoOfAction(anyString(),
                anyString(),
                anyString(),
                anyString(),
                anyString()))
                .thenReturn(Mono.just(returnedActionDataByThirdService));

        ActionStatusData actionStatusExpected = buildDefaultActionStatus();

        this.actionService.lookUpActionStatus(this.card.getPublisher()
                , this.card.getProcessId()
                , this.card.getState()
                , "action1"
                , JWT_TOKEN_VALUE)
                .subscribe(testedActionStatus -> assertThat(testedActionStatus).isEqualTo(actionStatusExpected));
    }

    @Test
    void lookUpActionStatusWithWrongState()  {
        Mockito.when(cardConsultationClient.fetchMonoCard(anyString(), anyString()))
                .thenReturn(Mono.just(card));

        StepVerifier.create(
                this.actionService.lookUpActionStatus(this.card.getPublisher()
                        , this.card.getProcessId()
                        , WRONG_STATE
                        , "action1"
                        , JWT_TOKEN_VALUE))
                .expectError(ApiErrorException.class)
                .verify();
    }

    @Test
    void lookUpActionStatusWithEmptyCard() {
        Mockito.when(cardConsultationClient.fetchMonoCard(anyString(), anyString()))
                .thenReturn(
                        Mono.error(new ApiErrorException(ApiError.builder().status(HttpStatus.NOT_FOUND)
                                .message(CardConsultationClient.CARD_FETCH_ERROR).build()))
                );

        StepVerifier.create(
                this.actionService.lookUpActionStatus("no_publisher"
                        , this.card.getProcessId()
                        , this.card.getState()
                        , "action1"
                        , JWT_TOKEN_VALUE))
                .consumeErrorWith(error -> {
                    assertThat(error).isInstanceOf(ApiErrorException.class);
                    assertEquals(CardConsultationClient.CARD_FETCH_ERROR, error.getMessage());
                })
                .verify()
        ;
    }

    @Test
    void lookUpActionStatusWithAction404() {
        Mockito.when(cardConsultationClient.fetchMonoCard(anyString(), anyString()))
                .thenReturn(Mono.just(card));

        Mockito.when(thirdClient.fetchMonoOfAction(anyString(), anyString(), anyString(), anyString(), anyString()))
                .thenReturn(
                        Mono.error(new ApiErrorException(ApiError.builder().status(HttpStatus.NOT_FOUND)
                                .message(ThirdClient.ACTION_FETCH_ERROR).build()))
                );

        StepVerifier.create(
                this.actionService.lookUpActionStatus(
                        this.card.getPublisher()
                        , this.card.getProcessId()
                        , this.card.getState()
                        , "unexisting"
                        , JWT_TOKEN_VALUE))
                .consumeErrorWith(error -> {
                    assertThat(error).isInstanceOf(ApiErrorException.class);
                    assertThat(ThirdClient.ACTION_FETCH_ERROR).isEqualTo(error.getMessage());
                })
                .verify();
    }


    private String mapDefaultActionStatus() throws JsonProcessingException {
        ActionStatusData actionStatus = buildDefaultActionStatus();
        return mapActionStatus(actionStatus);
    }

    @Test
    void submitAction() throws JsonProcessingException, URISyntaxException {
        Mockito.when(cardConsultationClient.fetchMonoCard(anyString(), anyString()))
                .thenReturn(Mono.just(card));
        ActionData returnedActionDataByThirdService = ActionData.builder()
                .label(I18nData.builder()
                        .key("new.label")
                        .build())
                .url(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)
                .build();
        Mockito.when(thirdClient.fetchMonoOfAction(anyString(), anyString(),anyString(), anyString(),anyString()))
                .thenReturn(Mono.just(returnedActionDataByThirdService));

        ActionStatusData actionStatus = buildDefaultActionStatus();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapActionStatus(actionStatus))
                );
        StepVerifier.create(
                this.actionService.submitAction(
                        this.card.getPublisher()
                        , this.card.getProcessId()
                        , this.card.getState()
                        , "action1"
                        , JWT_TOKEN_VALUE
                        , null))

                .consumeNextWith(testedActionStatus -> assertThat(testedActionStatus)
                        .isEqualTo(actionStatus))
                .verifyComplete();

    }

    @Test
    void submitActionEmptyCard() {

        Mockito.when(cardConsultationClient.fetchMonoCard(anyString(), anyString()))
                .thenReturn(
                        Mono.error(new ApiErrorException(ApiError.builder().status(HttpStatus.NOT_FOUND)
                                .message(CardConsultationClient.CARD_FETCH_ERROR).build()))
                );

        StepVerifier.create(
                this.actionService.submitAction("no_publisher"
                        , this.card.getProcessId()
                        , this.card.getState()
                        , "action1"
                        , JWT_TOKEN_VALUE
                        , null))
                .consumeErrorWith(error -> {
                    assertThat(error).isInstanceOf(ApiErrorException.class);
                    assertThat(error.getMessage()).isEqualTo(
                            CardConsultationClient.CARD_FETCH_ERROR
                    );
                })
                .verify();
    }

    @Test
    void submitActionWrongState() throws JsonProcessingException, URISyntaxException {
        Mockito.when(cardConsultationClient.fetchMonoCard(anyString(), anyString()))
                .thenReturn(Mono.just(card));

        ActionData returnedActionDataByThirdService = ActionData.builder()
                .label(I18nData.builder()
                        .key("new.label")
                        .build())
                .url(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)
                .build();
        Mockito.when(thirdClient.fetchMonoOfAction(anyString(), anyString(), anyString(), anyString(), anyString()))
                .thenReturn(Mono.just(returnedActionDataByThirdService));

        StepVerifier.create(
                this.actionService.submitAction(this.card.getPublisher()
                        , this.card.getProcessId()
                        , WRONG_STATE
                        , "action1"
                        , JWT_TOKEN_VALUE, null))
                .consumeErrorWith(error -> {
                    assertThat(error).isInstanceOf(ApiErrorException.class);
                    assertThat(error.getMessage()).isEqualTo(
                            ActionService.BAD_STATE_MESSAGE
                    );
                }).verify();
    }

    @Test
    void submitActionCard404() throws JsonProcessingException, URISyntaxException {

        Mockito.when(cardConsultationClient.fetchMonoCard(anyString(), anyString()))
                .thenReturn(Mono.just(card));

        Mockito.when(thirdClient.fetchMonoOfAction(anyString(), anyString(), anyString(), anyString(), anyString()))
                .thenReturn(
                        Mono.error(new ApiErrorException(ApiError.builder().status(HttpStatus.NOT_FOUND)
                                .message(ThirdClient.NO_THIRD_ACTION_MESSAGE).build()))
                );

        StepVerifier.create(
            this.actionService.submitAction(
                    "unexisting"
                    , this.card.getProcessId()
                    , this.card.getState()
                    , "action1"
                    , JWT_TOKEN_VALUE
                    , null))
                .consumeErrorWith(error -> {
                    assertThat(error).isInstanceOf(ApiErrorException.class);
                    assertThat(error.getMessage()).isEqualTo(
                            ThirdClient.NO_THIRD_ACTION_MESSAGE
                    );
                }).verify();
    }

    @Test
    void submitActionCard401() {

        Mockito.when(cardConsultationClient.fetchMonoCard(anyString(), anyString()))
                .thenReturn(Mono.just(card));

        Mockito.when(thirdClient.fetchMonoOfAction(anyString(), anyString(), anyString(), anyString(), anyString()))
                .thenReturn(
                        Mono.error(new ApiErrorException(ApiError.builder().status(HttpStatus.UNAUTHORIZED)
                                .message(ThirdClient.THIRD_401_MESSAGE).build()))
                );
        StepVerifier.create(
            this.actionService.submitAction("unauthorized"
                    , this.card.getProcessId()
                    , this.card.getState()
                    , "action1"
                    , JWT_TOKEN_VALUE, null))
                .consumeErrorWith(error -> {
                    assertThat(error).isInstanceOf(ApiErrorException.class);
                    assertThat(error.getMessage()).isEqualTo(
                            ThirdClient.THIRD_401_MESSAGE
                    );
                }).verify();;

}

    @Test
    void submitActionCard403() {
        Mockito.when(cardConsultationClient.fetchMonoCard(anyString(), anyString()))
                .thenReturn(Mono.just(card));

        Mockito.when(thirdClient.fetchMonoOfAction(anyString(), anyString(), anyString(), anyString(), anyString()))
                .thenReturn(
                        Mono.error(new ApiErrorException(ApiError.builder().status(HttpStatus.UNAUTHORIZED)
                                .message(ThirdClient.THIRD_403_MESSAGE).build()))
                );
        StepVerifier.create(
                this.actionService.submitAction("forbidden"
                    , this.card.getProcessId()
                    , this.card.getState()
                    , "action1"
                    , JWT_TOKEN_VALUE
                    , null))
                        .consumeErrorWith(error -> {
                            assertThat(error).isInstanceOf(ApiErrorException.class);
                            assertThat(error.getMessage()).isEqualTo(
                                    ThirdClient.THIRD_403_MESSAGE
                            );
                        }).verify();
    }

    @Test
    void submitActionNoActionReturned() throws  URISyntaxException {

        Mockito.when(cardConsultationClient.fetchMonoCard(anyString(), anyString()))
                .thenReturn(Mono.just(card));
        ActionData returnedActionDataByThirdService = ActionData.builder()
                .label(I18nData.builder()
                        .key("new.label")
                        .build())
                .url(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)
                .build();
        Mockito.when(thirdClient.fetchMonoOfAction(anyString(), anyString(),anyString(), anyString(),anyString()))
                .thenReturn(Mono.just(returnedActionDataByThirdService));

        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("")
                );
        StepVerifier.create(
                this.actionService.submitAction(this.card.getPublisher()
                    , this.card.getProcessId()
                    , this.card.getState()
                    , "action_empty"
                    , JWT_TOKEN_VALUE, null))
                .consumeErrorWith(error -> {
                    assertThat(error).isInstanceOf(ApiErrorException.class);
                    assertThat(error.getMessage()).isEqualTo(
                            ActionService.EMPTY_RESULT_MESSAGE
                    );
                }).verify();
    }
    @Test
    void submitActionEmptyAction() throws JsonProcessingException, URISyntaxException {

        Mockito.when(cardConsultationClient.fetchMonoCard(anyString(), anyString()))
                .thenReturn(Mono.just(card));
        ActionData returnedActionDataByThirdService = ActionData.builder()
                .label(I18nData.builder()
                        .key("new.label")
                        .build())
                .url(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)
                .build();
        Mockito.when(thirdClient.fetchMonoOfAction(anyString(), anyString(),anyString(), anyString(),anyString()))
                .thenReturn(Mono.just(returnedActionDataByThirdService));

        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{}")
                );
        StepVerifier.create(
                this.actionService.submitAction(this.card.getPublisher()
                        , this.card.getProcessId()
                        , this.card.getState()
                        , "action_empty"
                        , JWT_TOKEN_VALUE, null))
                .consumeErrorWith(error -> {
                    assertThat(error).isInstanceOf(ApiErrorException.class);
                    assertThat(error.getMessage()).isEqualTo(
                            ActionService.EMPTY_RESULT_MESSAGE
                    );
                }).verify();
    }

    @Test
    void submitActionAction404() throws URISyntaxException {
        Mockito.when(cardConsultationClient.fetchMonoCard(anyString(), anyString()))
                .thenReturn(Mono.just(card));

        ActionData returnedActionDataByThirdService = ActionData.builder()
                .label(I18nData.builder()
                        .key("new.label")
                        .build())
                .url(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)
                .build();
        Mockito.when(thirdClient.fetchMonoOfAction(anyString(), anyString(),anyString(), anyString(),anyString()))
                .thenReturn(Mono.just(returnedActionDataByThirdService));

        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.NOT_FOUND));

        StepVerifier.create(
                this.actionService.submitAction(this.card.getPublisher()
                        , this.card.getProcessId()
                        , this.card.getState()
                        , "unexisting"
                        , JWT_TOKEN_VALUE
                        , null))
                        .consumeErrorWith(error -> {
            assertThat(error).isInstanceOf(ApiErrorException.class);
            assertThat(error.getMessage()).isEqualTo(
                    ActionService.REMOTE_404_MESSAGE
            );
        }).verify();

    }

    @Test
    void submitActionAction401() throws URISyntaxException {
        Mockito.when(cardConsultationClient.fetchMonoCard(anyString(), anyString()))
                .thenReturn(Mono.just(card));

        ActionData returnedActionDataByThirdService = ActionData.builder()
                .label(I18nData.builder()
                        .key("new.label")
                        .build())
                .url(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)
                .build();
        Mockito.when(thirdClient.fetchMonoOfAction(anyString(), anyString(),anyString(), anyString(),anyString()))
                .thenReturn(Mono.just(returnedActionDataByThirdService));

        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.UNAUTHORIZED));

        StepVerifier.create(
            this.actionService.submitAction(this.card.getPublisher()
                    , this.card.getProcessId()
                    , this.card.getState()
                    , "unauthorized"
                    , JWT_TOKEN_VALUE
                    , null))
                        .consumeErrorWith(error -> {
            assertThat(error).isInstanceOf(ApiErrorException.class);
            assertThat(error.getMessage()).isEqualTo(
                    ActionService.UNEXPECTED_REMOTE_3RD_MESSAGE
            );
        }).verify();

    }

    @Test
    void submitActionAction403() throws URISyntaxException {
        Mockito.when(cardConsultationClient.fetchMonoCard(anyString(), anyString()))
                .thenReturn(Mono.just(card));

        ActionData returnedActionDataByThirdService = ActionData.builder()
                .label(I18nData.builder()
                        .key("new.label")
                        .build())
                .url(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)
                .build();
        Mockito.when(thirdClient.fetchMonoOfAction(anyString(), anyString(),anyString(), anyString(),anyString()))
                .thenReturn(Mono.just(returnedActionDataByThirdService));

        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.FORBIDDEN));


        StepVerifier.create(
            this.actionService.submitAction(this.card.getPublisher()
                    , this.card.getProcessId()
                    , this.card.getState()
                    , "forbidden"
                    , JWT_TOKEN_VALUE, null))
                        .consumeErrorWith(error -> {
            assertThat(error).isInstanceOf(ApiErrorException.class);
            assertThat(error.getMessage()).isEqualTo(
                    ActionService.UNEXPECTED_REMOTE_3RD_MESSAGE
            );
        }).verify();

    }
    @Getter
    public static class TestClass1 {
        private TestClass2 value1 = new TestClass2();
    }

    @Getter
    public static class TestClass2 {
        private String value2 = "value";
    }

}
