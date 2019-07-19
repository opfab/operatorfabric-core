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
        assertThat(this.actionService.replaceTokens(this.action, this.card, "abc"))
                .isEqualTo("http://somewhere:111/process/state/action?access_token=abc");
    }

    @Test
    void updateAction() throws URISyntaxException, JsonProcessingException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapper.writeValueAsString(actionStatus))
                );
        assertThat(this.actionService.updateAction(this.action, this.card, "abc")).isEqualTo(actionStatus);
    }

    @Test
    void updateActionEmpty() throws URISyntaxException, JsonProcessingException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.NO_CONTENT)
                        .contentType(MediaType.APPLICATION_JSON)
                );
        assertThat(this.actionService.updateAction(this.action, this.card, "abc")).isNull();
    }

    @Test
    void updateAction404() throws URISyntaxException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.NOT_FOUND)
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.updateAction(this.action, this.card, "abc");
        }).withMessage(ActionService.REMOTE_404_MESSAGE);
    }

    @Test
    void updateAction503() throws URISyntaxException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE)
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.updateAction(this.action, this.card, "abc");
        }).withMessage(ActionService.UNEXPECTED_REMOTE_3RD_MESSAGE);
    }

    @Test
    void sendAction() throws URISyntaxException, JsonProcessingException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapper.writeValueAsString(actionStatus))
                );
        assertThat(this.actionService.sendAction(this.action, this.card, "abc", null)).isEqualTo(actionStatus);
    }

    @Test
    void sendAction404() throws URISyntaxException, JsonProcessingException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.NOT_FOUND)
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.sendAction(this.action, this.card, "abc", null);
        }).withMessage(ActionService.REMOTE_404_MESSAGE);
    }

    @Test
    void sendAction503() throws URISyntaxException, JsonProcessingException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE)
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.sendAction(this.action, this.card, "abc", null);
        }).withMessage(ActionService.UNEXPECTED_REMOTE_3RD_MESSAGE);
    }

    @Test
    void lookUpActionStatus() throws JsonProcessingException, URISyntaxException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapper.writeValueAsString(actionStatus))
                );
        assertThat(this.actionService.lookUpActionStatus(this.card.getPublisher(), this.card.getProcessId(), this.card.getState(), "action1", "abc")).isEqualTo(actionStatus);
    }
    @Test
    void lookUpActionStatusWithWrongState() throws JsonProcessingException, URISyntaxException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapper.writeValueAsString(actionStatus))
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.lookUpActionStatus(this.card.getPublisher(), this.card.getProcessId(), "foobar", "action1", "abc");
        }).withMessage(ActionService.BAD_STATE_MESSAGE);
    }

    @Test
    void lookUpActionStatusWithEmptyCard() throws JsonProcessingException, URISyntaxException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapper.writeValueAsString(actionStatus))
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.lookUpActionStatus("no_publisher", this.card.getProcessId(), this.card.getState(), "action1", "abc");
        }).withMessage(ActionService.EMPTY_RESULT_MESSAGE);
    }

    @Test
    void lookUpActionStatusWithCard404() throws JsonProcessingException, URISyntaxException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapper.writeValueAsString(actionStatus))
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.lookUpActionStatus("unexisting", this.card.getProcessId(), this.card.getState(), "action1", "abc");
        }).withMessage(ActionService.NO_SUCH_CARD_OR_ACTION_MESSAGE);
    }

    @Test
    void lookUpActionStatusWithCard401() throws JsonProcessingException, URISyntaxException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapper.writeValueAsString(actionStatus))
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.lookUpActionStatus("unauthorized", this.card.getProcessId(), this.card.getState(), "action1", "abc");
        }).withMessage(ActionService.FEIGN_401_MESSAGE);
    }

    @Test
    void lookUpActionStatusWithCard403() throws JsonProcessingException, URISyntaxException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapper.writeValueAsString(actionStatus))
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.lookUpActionStatus("forbidden", this.card.getProcessId(), this.card.getState(), "action1", "abc");
        }).withMessage(ActionService.FEIGN_403_MESSAGE);
    }

    @Test
    void lookUpActionStatusWithEmptyAction() throws JsonProcessingException, URISyntaxException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapper.writeValueAsString(actionStatus))
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.lookUpActionStatus(this.card.getPublisher(), this.card.getProcessId(), this.card.getState(), "action_empty", "abc");
        }).withMessage(ActionService.EMPTY_RESULT_MESSAGE);
    }

    @Test
    void lookUpActionStatusWithAction404() throws JsonProcessingException, URISyntaxException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapper.writeValueAsString(actionStatus))
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.lookUpActionStatus(this.card.getPublisher(), this.card.getProcessId(), this.card.getState(), "unexisting", "abc");
        }).withMessage(ActionService.NO_SUCH_CARD_OR_ACTION_MESSAGE);
    }

    @Test
    void submitAction() throws JsonProcessingException, URISyntaxException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapper.writeValueAsString(actionStatus))
                );
        assertThat(this.actionService.submitAction(this.card.getPublisher(), this.card.getProcessId(), this.card.getState(), "action1", "abc", null)).isEqualTo(actionStatus);
    }

    @Test
    void submitActionEmptyCard() throws JsonProcessingException, URISyntaxException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapper.writeValueAsString(actionStatus))
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.submitAction("no_publisher", this.card.getProcessId(), this.card.getState(), "action1", "abc", null);
        }).withMessage(ActionService.EMPTY_RESULT_MESSAGE);
    }

    @Test
    void submitActionWrongState() throws JsonProcessingException, URISyntaxException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapper.writeValueAsString(actionStatus))
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.submitAction(this.card.getPublisher(), this.card.getProcessId(), "foobar", "action1", "abc", null);
        }).withMessage(ActionService.BAD_STATE_MESSAGE);
    }

    @Test
    void submitActionCard404() throws JsonProcessingException, URISyntaxException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapper.writeValueAsString(actionStatus))
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.submitAction("unexisting", this.card.getProcessId(), this.card.getState(), "action1", "abc", null);
        }).withMessage(ActionService.NO_SUCH_CARD_OR_ACTION_MESSAGE);
    }

    @Test
    void submitActionCard401() throws JsonProcessingException, URISyntaxException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapper.writeValueAsString(actionStatus))
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.submitAction("unauthorized", this.card.getProcessId(), this.card.getState(), "action1", "abc", null);
        }).withMessage(ActionService.FEIGN_401_MESSAGE);
    }

    @Test
    void submitActionCard403() throws JsonProcessingException, URISyntaxException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapper.writeValueAsString(actionStatus))
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.submitAction("forbidden", this.card.getProcessId(), this.card.getState(), "action1", "abc", null);
        }).withMessage(ActionService.FEIGN_403_MESSAGE);
    }

    @Test
    void submitActionEmptyAction() throws JsonProcessingException, URISyntaxException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapper.writeValueAsString(actionStatus))
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.submitAction(this.card.getPublisher(), this.card.getProcessId(), this.card.getState(), "action_empty", "abc", null);
        }).withMessage(ActionService.EMPTY_RESULT_MESSAGE);
    }

    @Test
    void submitActionAction404() throws JsonProcessingException, URISyntaxException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapper.writeValueAsString(actionStatus))
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.submitAction(this.card.getPublisher(), this.card.getProcessId(), this.card.getState(), "unexisting", "abc", null);
        }).withMessage(ActionService.NO_SUCH_CARD_OR_ACTION_MESSAGE);
    }

    @Test
    void submitActionAction401() throws JsonProcessingException, URISyntaxException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapper.writeValueAsString(actionStatus))
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.submitAction(this.card.getPublisher(), this.card.getProcessId(), this.card.getState(), "unauthorized", "abc", null);
        }).withMessage(ActionService.FEIGN_401_MESSAGE);
    }

    @Test
    void submitActionAction403() throws JsonProcessingException, URISyntaxException {
        ActionStatusData actionStatus = ActionStatusData.builder()
                .label(I18nData.builder().key("new.label").build())
                .build();
        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI("http://somewhere:111/process/state/action?access_token=abc")))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(mapper.writeValueAsString(actionStatus))
                );
        assertException(ApiErrorException.class).isThrownBy(() -> {
            this.actionService.submitAction(this.card.getPublisher(), this.card.getProcessId(), this.card.getState(), "forbidden", "abc", null);
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
