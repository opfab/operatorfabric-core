/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.users.services;

import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.users.application.UnitTestApplication;
import org.opfab.users.model.PerimeterData;
import org.opfab.users.model.RightsEnum;
import org.opfab.users.model.StateRightData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Arrays;
import java.util.HashSet;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UnitTestApplication.class)
@Slf4j
@ActiveProfiles("test")
public class UserServiceShould {

    @Autowired
    UserServiceImp userService;

    @Test
    public void testIsEachStateUniqueInPerimeter() {
        PerimeterData p1, p2, p3, p4;
        p1 = PerimeterData.builder().id("PERIMETER1_1").process("process1")
                .stateRights(new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.RECEIVE)))).build();

        p2 = PerimeterData.builder().id("PERIMETER1_2").process("process1")
                .stateRights(new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.RECEIVEANDWRITE),
                                                         new StateRightData("state2", RightsEnum.WRITE)))).build();

        p3 = PerimeterData.builder().id("PERIMETER2").process("process2")
                .stateRights(new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.WRITE),
                                                         new StateRightData("state1", RightsEnum.RECEIVEANDWRITE)))).build();

        p4 = PerimeterData.builder().id("PERIMETER2").process("process2")
                .stateRights(new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.WRITE),
                                                         new StateRightData("state2", RightsEnum.RECEIVE),
                                                         new StateRightData("state1", RightsEnum.RECEIVEANDWRITE)))).build();

        Assertions.assertThat(userService.isEachStateUniqueInPerimeter(p1)).isTrue();
        Assertions.assertThat(userService.isEachStateUniqueInPerimeter(p2)).isTrue();
        Assertions.assertThat(userService.isEachStateUniqueInPerimeter(p3)).isFalse();
        Assertions.assertThat(userService.isEachStateUniqueInPerimeter(p4)).isFalse();
    }
}
