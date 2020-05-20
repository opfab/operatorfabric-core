/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.users.model;

import org.junit.jupiter.api.Test;

import java.util.*;

public class CurrentUserWithPerimetersDataShould {

    @Test
    public void testComputePerimeters(){

        Perimeter p1 = PerimeterData.builder().
                id("perimeterKarate10_1_RR").
                process("process10").
                stateRights(new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.READANDRESPOND),
                                                        new StateRightData("state2", RightsEnum.READANDWRITE)))).
                build();

        Perimeter p2 = PerimeterData.builder().
                    id("perimeterKarate10_1_R").
                    process("process10").
                    stateRights(new HashSet<>(Arrays.asList(new StateRightData("state2", RightsEnum.READANDWRITE)))).
                    build();

        CurrentUserWithPerimetersData c = new CurrentUserWithPerimetersData();

        c.computePerimeters(new HashSet<>(Arrays.asList(p1, p2)));

        ComputedPerimeterData c1 = ComputedPerimeterData.builder().process("process10").state("state1").rights(RightsEnum.READANDRESPOND).build();
        ComputedPerimeterData c2 = ComputedPerimeterData.builder().process("process10").state("state2").rights(RightsEnum.READANDWRITE).build();

        org.assertj.core.api.Assertions.assertThat(c.getComputedPerimeters()).hasSize(2);
        org.assertj.core.api.Assertions.assertThat(c.getComputedPerimeters()).containsExactlyInAnyOrder(c1, c2);
    }

    @Test
    public void testMergeRights() {

        List<RightsEnum>    list0 = null;
        List<RightsEnum>    list00 = new ArrayList<>();

        List<RightsEnum>    list1 = new ArrayList<>(Arrays.asList(RightsEnum.READ, RightsEnum.READ));
        List<RightsEnum>    list2 = new ArrayList<>(Arrays.asList(RightsEnum.READ, RightsEnum.READANDRESPOND));
        List<RightsEnum>    list3 = new ArrayList<>(Arrays.asList(RightsEnum.READ, RightsEnum.READANDWRITE));
        List<RightsEnum>    list4 = new ArrayList<>(Arrays.asList(RightsEnum.READ, RightsEnum.ALL));

        List<RightsEnum>    list5 = new ArrayList<>(Arrays.asList(RightsEnum.READANDRESPOND, RightsEnum.READ));
        List<RightsEnum>    list6 = new ArrayList<>(Arrays.asList(RightsEnum.READANDRESPOND, RightsEnum.READANDRESPOND));
        List<RightsEnum>    list7 = new ArrayList<>(Arrays.asList(RightsEnum.READANDRESPOND, RightsEnum.READANDWRITE));
        List<RightsEnum>    list8 = new ArrayList<>(Arrays.asList(RightsEnum.READANDRESPOND, RightsEnum.ALL));

        List<RightsEnum>     list9 = new ArrayList<>(Arrays.asList(RightsEnum.READANDWRITE, RightsEnum.READ));
        List<RightsEnum>    list10 = new ArrayList<>(Arrays.asList(RightsEnum.READANDWRITE, RightsEnum.READANDRESPOND));
        List<RightsEnum>    list11 = new ArrayList<>(Arrays.asList(RightsEnum.READANDWRITE, RightsEnum.READANDWRITE));
        List<RightsEnum>    list12 = new ArrayList<>(Arrays.asList(RightsEnum.READANDWRITE, RightsEnum.ALL));

        List<RightsEnum>    list13 = new ArrayList<>(Arrays.asList(RightsEnum.ALL, RightsEnum.READ));
        List<RightsEnum>    list14 = new ArrayList<>(Arrays.asList(RightsEnum.ALL, RightsEnum.READANDRESPOND));
        List<RightsEnum>    list15 = new ArrayList<>(Arrays.asList(RightsEnum.ALL, RightsEnum.READANDWRITE));
        List<RightsEnum>    list16 = new ArrayList<>(Arrays.asList(RightsEnum.ALL, RightsEnum.ALL));

        List<RightsEnum>    list17 = new ArrayList<>(Arrays.asList(RightsEnum.READ, RightsEnum.READ, RightsEnum.READ)); //READ
        List<RightsEnum>    list18 = new ArrayList<>(Arrays.asList(RightsEnum.READANDRESPOND, RightsEnum.READ, RightsEnum.READ)); //READANDRESPOND
        List<RightsEnum>    list19 = new ArrayList<>(Arrays.asList(RightsEnum.READ, RightsEnum.READANDWRITE, RightsEnum.READ));  //READANDWRITE
        List<RightsEnum>    list20 = new ArrayList<>(Arrays.asList(RightsEnum.READANDRESPOND, RightsEnum.READ, RightsEnum.READANDWRITE));  //ALL
        List<RightsEnum>    list21 = new ArrayList<>(Arrays.asList(RightsEnum.READANDWRITE, RightsEnum.READ, RightsEnum.ALL, RightsEnum.READANDRESPOND));  //ALL

        CurrentUserWithPerimetersData c = new CurrentUserWithPerimetersData();

        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list0)).isNull();
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list00)).isNull();

        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list1)).isEqualByComparingTo(RightsEnum.READ);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list2)).isEqualByComparingTo(RightsEnum.READANDRESPOND);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list3)).isEqualByComparingTo(RightsEnum.READANDWRITE);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list4)).isEqualByComparingTo(RightsEnum.ALL);

        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list5)).isEqualByComparingTo(RightsEnum.READANDRESPOND);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list6)).isEqualByComparingTo(RightsEnum.READANDRESPOND);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list7)).isEqualByComparingTo(RightsEnum.ALL);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list8)).isEqualByComparingTo(RightsEnum.ALL);

        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list9)).isEqualByComparingTo(RightsEnum.READANDWRITE);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list10)).isEqualByComparingTo(RightsEnum.ALL);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list11)).isEqualByComparingTo(RightsEnum.READANDWRITE);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list12)).isEqualByComparingTo(RightsEnum.ALL);

        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list13)).isEqualByComparingTo(RightsEnum.ALL);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list14)).isEqualByComparingTo(RightsEnum.ALL);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list15)).isEqualByComparingTo(RightsEnum.ALL);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list16)).isEqualByComparingTo(RightsEnum.ALL);

        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list17)).isEqualByComparingTo(RightsEnum.READ);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list18)).isEqualByComparingTo(RightsEnum.READANDRESPOND);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list19)).isEqualByComparingTo(RightsEnum.READANDWRITE);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list20)).isEqualByComparingTo(RightsEnum.ALL);
        org.assertj.core.api.Assertions.assertThat(c.mergeRights(list21)).isEqualByComparingTo(RightsEnum.ALL);
    }
}

