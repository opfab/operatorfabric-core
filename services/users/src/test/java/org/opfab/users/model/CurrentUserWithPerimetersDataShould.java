/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.users.model;

import org.junit.jupiter.api.Test;

import java.util.*;

class CurrentUserWithPerimetersDataShould {

    @Test
    void testComputePerimeters(){

        Perimeter p1 = new Perimeter();
        p1.setId("perimeterKarate10_1_RR");
        p1.setProcess("process10");
        StateRight s1 = new StateRight("state1", RightEnum.Receive, true);
        StateRight s2 = new StateRight("state2", RightEnum.Receive, false);
        List<StateRight> stateRights = new ArrayList<>();
        stateRights.add(s1);
        stateRights.add(s2);
        p1.setStateRights(stateRights);

        Perimeter p2 = new Perimeter();
        p2.setId("perimeterKarate10_1_R");
        p2.setProcess("process10");
        StateRight s3 = new StateRight("state2", RightEnum.ReceiveAndWrite, true);
        List<StateRight> stateRights2 = new ArrayList<>();
        stateRights2.add(s3);
        p2.setStateRights(stateRights2);

        CurrentUserWithPerimeters c = new CurrentUserWithPerimeters();

        c.computePerimeters(new HashSet<>(Arrays.asList(p1, p2)));

        ComputedPerimeter c1 = new ComputedPerimeter();
        c1.setProcess("process10");
        c1.setState("state1");
        c1.setRights(RightEnum.Receive);
        c1.setFilteringNotificationAllowed(Boolean.TRUE);
                                                         
        ComputedPerimeter c2 = new ComputedPerimeter();
        c2.setProcess("process10");
        c2.setState("state2");
        c2.setRights(RightEnum.ReceiveAndWrite);
        c2.setFilteringNotificationAllowed(Boolean.FALSE);

        org.assertj.core.api.Assertions.assertThat(c.getComputedPerimeters()).hasSize(2);
        org.assertj.core.api.Assertions.assertThat(c.getComputedPerimeters()).contains(c1, c2);
    }

    @Test
    void testMergeRights() {

        List<RightEnum>    list0 = null;
        List<RightEnum>    list00 = new ArrayList<>();

        List<RightEnum>    list1 = new ArrayList<>(Arrays.asList(RightEnum.Receive, RightEnum.Receive));
        List<RightEnum>    list2 = new ArrayList<>(Arrays.asList(RightEnum.Receive, RightEnum.ReceiveAndWrite));

        List<RightEnum>    list3 = new ArrayList<>(Arrays.asList(RightEnum.ReceiveAndWrite, RightEnum.Receive));
        List<RightEnum>    list4 = new ArrayList<>(Arrays.asList(RightEnum.ReceiveAndWrite, RightEnum.ReceiveAndWrite));

        List<RightEnum>    list5 = new ArrayList<>(Arrays.asList(RightEnum.Receive, RightEnum.Receive, RightEnum.Receive)); //RECEIVE
        List<RightEnum>    list6 = new ArrayList<>(Arrays.asList(RightEnum.ReceiveAndWrite, RightEnum.Receive, RightEnum.Receive)); //RECEIVEANDWRITE
        List<RightEnum>    list7 = new ArrayList<>(Arrays.asList(RightEnum.Receive, RightEnum.ReceiveAndWrite, RightEnum.ReceiveAndWrite));  //RECEIVEANDWRITE

        CurrentUserWithPerimeters c = new CurrentUserWithPerimeters();

        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list0)).isNull();
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list00)).isNull();

        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list1)).isEqualByComparingTo(RightEnum.Receive);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list2)).isEqualByComparingTo(RightEnum.ReceiveAndWrite);

        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list3)).isEqualByComparingTo(RightEnum.ReceiveAndWrite);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list4)).isEqualByComparingTo(RightEnum.ReceiveAndWrite);

        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list5)).isEqualByComparingTo(RightEnum.Receive);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list6)).isEqualByComparingTo(RightEnum.ReceiveAndWrite);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list7)).isEqualByComparingTo(RightEnum.ReceiveAndWrite);
    }
}

