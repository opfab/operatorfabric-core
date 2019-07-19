package org.lfenergy.operatorfabric.actions.model;

import com.netflix.discovery.converters.jackson.builder.ApplicationsJacksonBuilder;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.lfenergy.operatorfabric.test.AssertUtils.assertException;

class ActionStatusDataShould {


    @Test
    void createFromActionNoConditions(){
        Action action = ActionData.builder()
                .lockAction(true)
                .lockCard(false)
                .needsConfirm(true)
                .contentStyle("test style")
                .build();
        ActionStatus actionStatus = ActionStatusData.fromAction(action);
        assertThat(actionStatus.getLockAction()).isTrue();
        assertThat(actionStatus.getLockCard()).isFalse();
        assertThat(actionStatus.getNeedsConfirm()).isTrue();
        assertThat(actionStatus.getUpdateState()).isNull();
        assertThat(actionStatus.getUpdateStateBeforeAction()).isNull();
        assertThat(actionStatus.getButtonStyle()).isNull();
        assertThat(actionStatus.getLabel()).isNull();
        assertThat(actionStatus.getInputs()).isNull();
    }

    @Test
    void createFromActionWithConditions(){
        List<Input> inputs = new ArrayList<>();
        inputs.add(InputData.builder().type(InputEnum.TEXT).name("testInput").build());
        inputs.add(InputData.builder().type(InputEnum.BOOLEAN).name("boolInput").build());
        Action action = ActionData.builder()
                .label(I18nData.builder()
                        .key("test")
                .build())
                .inputs(inputs)
                .build();
        ActionStatus actionStatus = ActionStatusData.fromAction(action);
        assertThat(actionStatus.getLockAction()).isNull();
        assertThat(actionStatus.getLockCard()).isNull();
        assertThat(actionStatus.getNeedsConfirm()).isNull();
        assertThat(actionStatus.getUpdateState()).isNull();
        assertThat(actionStatus.getUpdateStateBeforeAction()).isNull();
        assertThat(actionStatus.getButtonStyle()).isNull();
        assertThat(actionStatus.getLabel()).isNotNull();
        assertThat(actionStatus.getLabel().getKey()).isEqualTo("test");
        assertThat(actionStatus.getInputs()).isEqualTo(inputs);
    }


    @Test
    void createFromActionWithModeConditions(){
        Action action = ActionData.builder()
                .label(I18nData.builder()
                        .key("test")
                        .parameter("first","firstValue")
                        .build())
                .build();
        ActionStatus actionStatus = ActionStatusData.fromAction(action);
        assertThat(actionStatus.getLockAction()).isNull();
        assertThat(actionStatus.getLockCard()).isNull();
        assertThat(actionStatus.getNeedsConfirm()).isNull();
        assertThat(actionStatus.getUpdateState()).isNull();
        assertThat(actionStatus.getUpdateStateBeforeAction()).isNull();
        assertThat(actionStatus.getButtonStyle()).isNull();
        assertThat(actionStatus.getLabel()).isNotNull();
        assertThat(actionStatus.getLabel().getKey()).isEqualTo("test");
        assertThat(actionStatus.getLabel().getParameters().containsKey("first")).isTrue();
        assertThat(actionStatus.getLabel().getParameters().get("first")).isEqualTo("firstValue");
        assertThat(actionStatus.getInputs()).isNull();
    }
}