/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
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

public class CurrentUserWithPerimetersDataShould {

    @Test
    public void testComputePerimeters(){

        Perimeter p1 = PerimeterData.builder().
                id("perimeterKarate10_1_RR").
                process("process10").
                stateRights(new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.RECEIVE),
                                                        new StateRightData("state2", RightsEnum.RECEIVE)))).
                build();

        Perimeter p2 = PerimeterData.builder().
                    id("perimeterKarate10_1_R").
                    process("process10").
                    stateRights(new HashSet<>(Arrays.asList(new StateRightData("state2", RightsEnum.WRITE)))).
                    build();

        CurrentUserWithPerimetersData c = new CurrentUserWithPerimetersData();

        c.computePerimeters(new HashSet<>(Arrays.asList(p1, p2)));

        ComputedPerimeterData c1 = ComputedPerimeterData.builder().process("process10").state("state1").rights(RightsEnum.RECEIVE).build();
        ComputedPerimeterData c2 = ComputedPerimeterData.builder().process("process10").state("state2").rights(RightsEnum.RECEIVEANDWRITE).build();

        org.assertj.core.api.Assertions.assertThat(c.getComputedPerimeters()).hasSize(2);
        org.assertj.core.api.Assertions.assertThat(c.getComputedPerimeters()).containsExactlyInAnyOrder(c1, c2);
    }

    @Test
    public void testMergeRights() {

        List<RightsEnum>    list0 = null;
        List<RightsEnum>    list00 = new ArrayList<>();

        List<RightsEnum>    list1 = new ArrayList<>(Arrays.asList(RightsEnum.RECEIVE, RightsEnum.RECEIVE));
        List<RightsEnum>    list2 = new ArrayList<>(Arrays.asList(RightsEnum.RECEIVE, RightsEnum.WRITE));
        List<RightsEnum>    list3 = new ArrayList<>(Arrays.asList(RightsEnum.RECEIVE, RightsEnum.RECEIVEANDWRITE));

        List<RightsEnum>    list4 = new ArrayList<>(Arrays.asList(RightsEnum.WRITE, RightsEnum.RECEIVE));
        List<RightsEnum>    list5 = new ArrayList<>(Arrays.asList(RightsEnum.WRITE, RightsEnum.WRITE));
        List<RightsEnum>    list6 = new ArrayList<>(Arrays.asList(RightsEnum.WRITE, RightsEnum.RECEIVEANDWRITE));

        List<RightsEnum>    list7 = new ArrayList<>(Arrays.asList(RightsEnum.RECEIVEANDWRITE, RightsEnum.RECEIVE));
        List<RightsEnum>    list8 = new ArrayList<>(Arrays.asList(RightsEnum.RECEIVEANDWRITE, RightsEnum.WRITE));
        List<RightsEnum>    list9 = new ArrayList<>(Arrays.asList(RightsEnum.RECEIVEANDWRITE, RightsEnum.RECEIVEANDWRITE));

        List<RightsEnum>    list10 = new ArrayList<>(Arrays.asList(RightsEnum.RECEIVE, RightsEnum.RECEIVE, RightsEnum.RECEIVE)); //RECEIVE
        List<RightsEnum>    list11 = new ArrayList<>(Arrays.asList(RightsEnum.RECEIVEANDWRITE, RightsEnum.RECEIVE, RightsEnum.RECEIVE)); //RECEIVEANDWRITE
        List<RightsEnum>    list12 = new ArrayList<>(Arrays.asList(RightsEnum.RECEIVE, RightsEnum.RECEIVEANDWRITE, RightsEnum.WRITE));  //RECEIVEANDWRITE
        List<RightsEnum>    list13 = new ArrayList<>(Arrays.asList(RightsEnum.RECEIVE, RightsEnum.WRITE));  //RECEIVEANDWRITE

        CurrentUserWithPerimetersData c = new CurrentUserWithPerimetersData();

        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list0)).isNull();
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list00)).isNull();

        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list1)).isEqualByComparingTo(RightsEnum.RECEIVE);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list2)).isEqualByComparingTo(RightsEnum.RECEIVEANDWRITE);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list3)).isEqualByComparingTo(RightsEnum.RECEIVEANDWRITE);

        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list4)).isEqualByComparingTo(RightsEnum.RECEIVEANDWRITE);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list5)).isEqualByComparingTo(RightsEnum.WRITE);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list6)).isEqualByComparingTo(RightsEnum.RECEIVEANDWRITE);

        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list7)).isEqualByComparingTo(RightsEnum.RECEIVEANDWRITE);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list8)).isEqualByComparingTo(RightsEnum.RECEIVEANDWRITE);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list9)).isEqualByComparingTo(RightsEnum.RECEIVEANDWRITE);

        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list10)).isEqualByComparingTo(RightsEnum.RECEIVE);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list11)).isEqualByComparingTo(RightsEnum.RECEIVEANDWRITE);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list12)).isEqualByComparingTo(RightsEnum.RECEIVEANDWRITE);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list13)).isEqualByComparingTo(RightsEnum.RECEIVEANDWRITE);
    }
}

