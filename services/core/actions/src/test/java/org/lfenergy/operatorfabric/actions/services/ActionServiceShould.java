package org.lfenergy.operatorfabric.actions.services;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.actions.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.cards.model.Card;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;


@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {IntegrationTestApplication.class, ActionService.class})
@Slf4j
@ActiveProfiles("test")
class ActionServiceShould {

    @Autowired
    private ActionService actionService;

    private Card card;

    @BeforeEach
    public void init(){
        card = new Card();
        card.setProcess("process");
        card.setProcessId("process-instance");
        card.setState("state");
        card.setData(new TestClass1());
    }

    @Test
    void extractToken() {
        Assertions.assertThat(this.actionService.extractToken(card,"jwt","token")).isEqualTo("token");
        Assertions.assertThat(this.actionService.extractToken(card,"process","token")).isEqualTo("process");
        Assertions.assertThat(this.actionService.extractToken(card,"processInstance","token")).isEqualTo("process-instance");
        Assertions.assertThat(this.actionService.extractToken(card,"state","token")).isEqualTo("state");
        Assertions.assertThat(this.actionService.extractToken(card,"data.value1.value2","token")).isEqualTo("value");
    }

    @Test
    void extractStringCardData() {
        Assertions.assertThat(this.actionService.extractStringCardData(card,"data.value1.value2")).isEqualTo("value");
    }

@Getter
public static class TestClass1{
    private TestClass2 value1 = new TestClass2();
}

@Getter
public static class TestClass2{
    private String value2 = "value";
}
}
