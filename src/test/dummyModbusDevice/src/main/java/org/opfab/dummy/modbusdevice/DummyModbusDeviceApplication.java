/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.dummy.modbusdevice;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;

@Slf4j
@SpringBootApplication
public class DummyModbusDeviceApplication {

    @Value("${modbus_client.port}")
    private int port;

    @Value("${modbus_client.readTimeout:10000}")
    private int readTimeout;

    @Value("${modbus_client.holdingRegistersSize:5}")
    private int holdingRegistersSize;


    public static void main(String[] args) {
        SpringApplication.run(DummyModbusDeviceApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(ApplicationContext ctx) {
        return args -> {

            DummyModbusDevice dummyModbusDevice = new DummyModbusDevice(port,readTimeout,holdingRegistersSize);
            dummyModbusDevice.startListening();

        };
    }

}