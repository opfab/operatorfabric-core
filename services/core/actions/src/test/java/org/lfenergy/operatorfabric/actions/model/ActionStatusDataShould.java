/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.actions.model;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ActionStatusDataShould {


    @Test
    void createFromActionNoConditions(){
        Action action = ActionData.builder()
                .lockAction(true)
                .build();
        ActionStatus actionStatus = ActionStatusData.fromAction(action);
        assertThat(actionStatus.getLockAction()).isTrue();
        assertThat(actionStatus.getUpdateStateBeforeAction()).isNull();
        assertThat(actionStatus.getButtonStyle()).isNull();
        assertThat(actionStatus.getLabel()).isNull();
    }

    @Test
    void createFromActionWithConditions(){
       Action action = ActionData.builder()
                .label(I18nData.builder()
                        .key("test")
                .build())
                .build();
        ActionStatus actionStatus = ActionStatusData.fromAction(action);
        assertThat(actionStatus.getLockAction()).isNull();
        assertThat(actionStatus.getUpdateStateBeforeAction()).isNull();
        assertThat(actionStatus.getButtonStyle()).isNull();
        assertThat(actionStatus.getLabel()).isNotNull();
        assertThat(actionStatus.getLabel().getKey()).isEqualTo("test");
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
        assertThat(actionStatus.getUpdateStateBeforeAction()).isNull();
        assertThat(actionStatus.getButtonStyle()).isNull();
        assertThat(actionStatus.getLabel()).isNotNull();
        assertThat(actionStatus.getLabel().getKey()).isEqualTo("test");
        assertThat(actionStatus.getLabel().getParameters().containsKey("first")).isTrue();
        assertThat(actionStatus.getLabel().getParameters().get("first")).isEqualTo("firstValue");
    }
}