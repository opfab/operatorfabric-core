/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
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
import org.lfenergy.operatorfabric.actions.model.Action;
import org.lfenergy.operatorfabric.actions.model.ActionData;
import org.lfenergy.operatorfabric.actions.model.ActionStatusData;
import org.lfenergy.operatorfabric.actions.model.I18nData;
import org.lfenergy.operatorfabric.cards.model.Card;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.client.ExpectedCount;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.test.web.client.RequestMatcher;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.URISyntaxException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.lfenergy.operatorfabric.test.AssertUtils.assertException;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;


@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {IntegrationTestApplication.class, ActionService.class})
@Slf4j
@ActiveProfiles("test")
public class ActionServiceShould {

    private static final String EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE = "http://somewhere:111/process/state/action?access_token=abc";
    public static final RequestMatcher EXPECTED_GET_METHOD = method(HttpMethod.GET);
    public static final String JWT_TOKEN_VALUE = "abc";
    public static final String WRONG_STATE = "foobar";

    @Autowired
    private ActionService actionService;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper mapper;

    private Card card;
    private Action action;
    private MockRestServiceServer mockServer;


    @BeforeEach
    public void init() {
        this.mockServer = MockRestServiceServer.createServer(restTemplate);
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
// test helpers
    private ActionStatusData buildMinimalActionStatus(String labelKey){
        return ActionStatusData.builder()
                .label(I18nData.builder().key(labelKey).build())
                .build();
    }

    private ActionStatusData buildDefaultActionStatus() {
        return buildMinimalActionStatus("new.label");

    }

    private String mapDefaultActionStatus() throws JsonProcessingException {
        ActionStatusData actionStatus = buildDefaultActionStatus();
        return mapActionStatus(actionStatus);
    }

    private String mapActionStatus(ActionStatusData actionStatus) throws JsonProcessingException {
        return mapper.writeValueAsString(actionStatus);
    }

    @Test
    void extractToken() {
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
    void leaveUrlWithCurlyBracesUntouch(){
        String urlWithoutCurlyBraces = "http://url-of-test-without-curly-braces/need/to/stay/untouched";
        this.action= ActionData.builder()
                    .url(urlWithoutCurlyBraces)
                    .build();
        assertThat(this.actionService.replaceTokens(this.action,this.card,"")).isEqualTo(urlWithoutCurlyBraces);

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
    void sendAction404() throws URISyntaxException, JsonProcessingException {
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
    void sendAction503() throws URISyntaxException, JsonProcessingException {
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
    void lookUpActionStatus() throws JsonProcessingException, URISyntaxException {
        ActionStatusData actionStatus = buildDefaultActionStatus();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(EXPECTED_GET_METHOD)
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapActionStatus(actionStatus))
                );
        assertThat(this.actionService.lookUpActionStatus(this.card.getPublisher(), this.card.getProcessId(), this.card.getState(), "action1", JWT_TOKEN_VALUE)).isEqualTo(actionStatus);
    }
    @Test
    void lookUpActionStatusWithWrongState() throws JsonProcessingException, URISyntaxException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(EXPECTED_GET_METHOD)
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapDefaultActionStatus())
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.lookUpActionStatus(this.card.getPublisher(), this.card.getProcessId(), WRONG_STATE, "action1", JWT_TOKEN_VALUE);
        }).withMessage(ActionService.BAD_STATE_MESSAGE);
    }

    @Test
    void lookUpActionStatusWithEmptyCard() throws JsonProcessingException, URISyntaxException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(EXPECTED_GET_METHOD)
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapDefaultActionStatus())
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.lookUpActionStatus("no_publisher", this.card.getProcessId(), this.card.getState(), "action1", JWT_TOKEN_VALUE);
        }).withMessage(ActionService.EMPTY_RESULT_MESSAGE);
    }

    @Test
    void lookUpActionStatusWithCard404() throws JsonProcessingException, URISyntaxException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(EXPECTED_GET_METHOD)
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapDefaultActionStatus())
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.lookUpActionStatus("unexisting", this.card.getProcessId(), this.card.getState(), "action1", JWT_TOKEN_VALUE);
        }).withMessage(ActionService.NO_SUCH_CARD_OR_ACTION_MESSAGE);
    }

    @Test
    void lookUpActionStatusWithCard401() throws JsonProcessingException, URISyntaxException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(EXPECTED_GET_METHOD)
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapDefaultActionStatus())
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.lookUpActionStatus("unauthorized", this.card.getProcessId(), this.card.getState(), "action1", JWT_TOKEN_VALUE);
        }).withMessage(ActionService.FEIGN_401_MESSAGE);
    }

    @Test
    void lookUpActionStatusWithCard403() throws JsonProcessingException, URISyntaxException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(EXPECTED_GET_METHOD)
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapDefaultActionStatus())
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.lookUpActionStatus("forbidden", this.card.getProcessId(), this.card.getState(), "action1", JWT_TOKEN_VALUE);
        }).withMessage(ActionService.FEIGN_403_MESSAGE);
    }

    @Test
    void lookUpActionStatusWithEmptyAction() throws JsonProcessingException, URISyntaxException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(EXPECTED_GET_METHOD)
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapDefaultActionStatus())
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.lookUpActionStatus(this.card.getPublisher(), this.card.getProcessId(), this.card.getState(), "action_empty", JWT_TOKEN_VALUE);
        }).withMessage(ActionService.EMPTY_RESULT_MESSAGE);
    }

    @Test
    void lookUpActionStatusWithAction404() throws JsonProcessingException, URISyntaxException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(EXPECTED_GET_METHOD)
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapDefaultActionStatus())
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.lookUpActionStatus(this.card.getPublisher(), this.card.getProcessId(), this.card.getState(), "unexisting", JWT_TOKEN_VALUE);
        }).withMessage(ActionService.NO_SUCH_CARD_OR_ACTION_MESSAGE);
    }

    @Test
    void submitAction() throws JsonProcessingException, URISyntaxException {
        ActionStatusData actionStatus = buildDefaultActionStatus();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapActionStatus(actionStatus))
                );
        assertThat(this.actionService.submitAction(this.card.getPublisher(), this.card.getProcessId(), this.card.getState(), "action1", JWT_TOKEN_VALUE, null)).isEqualTo(actionStatus);
    }

    @Test
    void submitActionEmptyCard() throws JsonProcessingException, URISyntaxException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapDefaultActionStatus())
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.submitAction("no_publisher", this.card.getProcessId(), this.card.getState(), "action1", JWT_TOKEN_VALUE, null);
        }).withMessage(ActionService.EMPTY_RESULT_MESSAGE);
    }

    @Test
    void submitActionWrongState() throws JsonProcessingException, URISyntaxException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapDefaultActionStatus())
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.submitAction(this.card.getPublisher(), this.card.getProcessId(), WRONG_STATE, "action1", JWT_TOKEN_VALUE, null);
        }).withMessage(ActionService.BAD_STATE_MESSAGE);
    }

    @Test
    void submitActionCard404() throws JsonProcessingException, URISyntaxException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapDefaultActionStatus())
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.submitAction("unexisting", this.card.getProcessId(), this.card.getState(), "action1", JWT_TOKEN_VALUE, null);
        }).withMessage(ActionService.NO_SUCH_CARD_OR_ACTION_MESSAGE);
    }

    @Test
    void submitActionCard401() throws JsonProcessingException, URISyntaxException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapDefaultActionStatus())
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.submitAction("unauthorized", this.card.getProcessId(), this.card.getState(), "action1", JWT_TOKEN_VALUE, null);
        }).withMessage(ActionService.FEIGN_401_MESSAGE);
    }

    @Test
    void submitActionCard403() throws JsonProcessingException, URISyntaxException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapDefaultActionStatus())
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.submitAction("forbidden", this.card.getProcessId(), this.card.getState(), "action1", JWT_TOKEN_VALUE, null);
        }).withMessage(ActionService.FEIGN_403_MESSAGE);
    }

    @Test
    void submitActionEmptyAction() throws JsonProcessingException, URISyntaxException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapDefaultActionStatus())
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.submitAction(this.card.getPublisher(), this.card.getProcessId(), this.card.getState(), "action_empty", JWT_TOKEN_VALUE, null);
        }).withMessage(ActionService.EMPTY_RESULT_MESSAGE);
    }

    @Test
    void submitActionAction404() throws JsonProcessingException, URISyntaxException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapDefaultActionStatus())
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.submitAction(this.card.getPublisher(), this.card.getProcessId(), this.card.getState(), "unexisting", JWT_TOKEN_VALUE, null);
        }).withMessage(ActionService.NO_SUCH_CARD_OR_ACTION_MESSAGE);
    }

    @Test
    void submitActionAction401() throws JsonProcessingException, URISyntaxException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapDefaultActionStatus())
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.submitAction(this.card.getPublisher(), this.card.getProcessId(), this.card.getState(), "unauthorized", JWT_TOKEN_VALUE, null);
        }).withMessage(ActionService.FEIGN_401_MESSAGE);
    }

    @Test
    void submitActionAction403() throws JsonProcessingException, URISyntaxException {
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXPECTED_URL_WITH_JWT_TOKEN_SUBSTITUTION_DONE)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapDefaultActionStatus())
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.submitAction(this.card.getPublisher(), this.card.getProcessId(), this.card.getState(), "forbidden", JWT_TOKEN_VALUE, null);
        }).withMessage(ActionService.FEIGN_403_MESSAGE);
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
