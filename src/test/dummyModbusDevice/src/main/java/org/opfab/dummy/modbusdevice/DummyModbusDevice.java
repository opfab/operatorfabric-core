/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.dummy.modbusdevice;

import com.intelligt.modbus.jlibmodbus.Modbus;
import com.intelligt.modbus.jlibmodbus.data.ModbusHoldingRegisters;
import com.intelligt.modbus.jlibmodbus.exception.ModbusIOException;
import com.intelligt.modbus.jlibmodbus.slave.ModbusSlave;
import com.intelligt.modbus.jlibmodbus.slave.ModbusSlaveFactory;
import com.intelligt.modbus.jlibmodbus.tcp.TcpParameters;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.locks.ReentrantLock;

@Slf4j
public class DummyModbusDevice {

    private final ModbusSlave modbusSlave;
    private final ReentrantLock lock = new ReentrantLock(true);

    public DummyModbusDevice(int port, int readTimeout, int holdingRegistersSize) {

        log.info("Attempting to initialize Modbus client");

        TcpParameters tcpParameters = new TcpParameters();
        tcpParameters.setKeepAlive(true);
        tcpParameters.setPort(port);
        modbusSlave = ModbusSlaveFactory.createModbusSlaveTCP(tcpParameters);
        modbusSlave.setReadTimeout(readTimeout);
        Modbus.setLogLevel(Modbus.LogLevel.LEVEL_DEBUG);

        OwnDataHolder dataHolder = new OwnDataHolder();
        dataHolder.addEventListener(new LoggingListener(modbusSlave));
        modbusSlave.setDataHolder(dataHolder);

        ModbusHoldingRegisters holdingRegisters = new ModbusHoldingRegisters(holdingRegistersSize);
        modbusSlave.getDataHolder().setHoldingRegisters(holdingRegisters);
        modbusSlave.setBroadcastEnabled(true);

        log.info("Initialization of modbus client was successful");
    }

    public void startListening() {
        try {
            modbusSlave.listen();
        } catch (ModbusIOException e) {
            log.error("Dummy modbus device stopped due to an exception",e);
        }

        if (modbusSlave.isListening()) {
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                lock.lock();
                try {
                    synchronized (modbusSlave) {
                        modbusSlave.notifyAll();
                    }
                } finally {
                    lock.unlock();
                }
            }));
        }
    }
}
