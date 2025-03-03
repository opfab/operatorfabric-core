/* Copyright (c) 2021-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.dummy.modbusdevice;

import com.intelligt.modbus.jlibmodbus.slave.ModbusSlave;

import java.util.Arrays;
import java.util.stream.Collectors;

public class LoggingListener implements ModbusEventListener {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(LoggingListener.class);

    private final ModbusSlave modbusSlave;

    public LoggingListener(ModbusSlave modbusSlave) {
        this.modbusSlave = modbusSlave;
    }

    @Override
    public void onWriteToSingleCoil(int address, boolean value) {
        // Not needed for our tests
    }

    @Override
    public void onWriteToMultipleCoils(int address, int quantity, boolean[] values) {
        // Not needed for our tests
    }

    @Override
    public void onWriteToSingleHoldingRegister(int address, int value) {
        log.info("onWriteToSingleHoldingRegister: register " + address + ", value " + value);
        log.debug("Current state of holding registers: " + currentHoldingRegistersState());
    }

    @Override
    public void onWriteToMultipleHoldingRegisters(int address, int quantity, int[] values) {
        // Not needed for our tests
    }

    private String currentHoldingRegistersState() {
        return Arrays.stream(modbusSlave.getDataHolder().getHoldingRegisters().getRegisters())
                .mapToObj(String::valueOf)
                .collect(Collectors.joining(" "));
    }

}
