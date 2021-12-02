/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.drivers;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.FileNotFoundException;
import java.net.InetAddress;
import java.net.UnknownHostException;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
@Slf4j
public class ModbusDriverFactoryShould {

    private static ModbusDriverFactory modbusDriverFactory;

    @BeforeAll
    public static void setUp() {
        modbusDriverFactory = new ModbusDriverFactory();
    }

    @Test
    public void modbusDriverFactoryShouldCreateDriverForResolvableHost() throws ExternalDeviceDriverException, UnknownHostException {

        ExternalDeviceDriver modbusDriver = modbusDriverFactory.create("123.45.67.1",123);

        assertThat(modbusDriver).isNotNull();
        assertThat(modbusDriver.getResolvedHost()).isEqualTo(InetAddress.getByName("123.45.67.1"));
        assertThat(modbusDriver.getPort()).isEqualTo(123);
        assertThat(modbusDriver.isConnected()).isFalse();

    }

    @Test
    public void modbusDriverFactoryShouldThrowErrorIfAttemptingToCreateDriverWithUnresolvableHost() {
        assertThrows(ExternalDeviceDriverException.class, () -> {modbusDriverFactory.create("unresolvableHost",123);});
    }

}
