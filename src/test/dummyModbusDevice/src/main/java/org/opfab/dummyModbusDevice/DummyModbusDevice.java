/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.dummyModbusDevice;

import com.intelligt.modbus.jlibmodbus.Modbus;
import com.intelligt.modbus.jlibmodbus.data.ModbusHoldingRegisters;
import com.intelligt.modbus.jlibmodbus.exception.ModbusIOException;
import com.intelligt.modbus.jlibmodbus.slave.ModbusSlave;
import com.intelligt.modbus.jlibmodbus.slave.ModbusSlaveFactory;
import com.intelligt.modbus.jlibmodbus.tcp.TcpParameters;
import lombok.extern.slf4j.Slf4j;

//TODO Will need to implement a generic ModbusDevice or even more generic ExternalDevice interface (in client?)

@Slf4j
public class DummyModbusDevice {

    private final ModbusSlave modbusSlave;

    public DummyModbusDevice(int port, int readTimeout) {

        log.info("Attempting to initialize Modbus client");

        TcpParameters tcpParameters = new TcpParameters();
        tcpParameters.setKeepAlive(true);
        tcpParameters.setPort(port);
        modbusSlave = ModbusSlaveFactory.createModbusSlaveTCP(tcpParameters);
        modbusSlave.setReadTimeout(readTimeout);
        Modbus.setLogLevel(Modbus.LogLevel.LEVEL_DEBUG);

        OwnDataHolder dataHolder = new OwnDataHolder();
        dataHolder.addEventListener(new LoggingListener());
        modbusSlave.setDataHolder(dataHolder);

        ModbusHoldingRegisters holdingRegisters = new ModbusHoldingRegisters(10); //TODO How many to replicate real CDS?
        modbusSlave.getDataHolder().setHoldingRegisters(holdingRegisters);
        modbusSlave.setBroadcastEnabled(true); //TODO What is it for ?

        log.info("Initialization of modbus client was successful");
    }

    public void startListening() {
        try {
            modbusSlave.listen();

            if (modbusSlave.isListening()) {
                Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                    synchronized (modbusSlave) {
                        modbusSlave.notifyAll();
                    }
                }));

                synchronized (modbusSlave) {
                    modbusSlave.wait();
                }

                /*
                 * using master-branch it should be #slave.close();
                 */
                modbusSlave.shutdown();
            }
        } catch (ModbusIOException | InterruptedException e) {
            e.printStackTrace();
        }
    }

}
