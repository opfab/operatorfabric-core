/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.drivers;

import com.intelligt.modbus.jlibmodbus.Modbus;
import com.intelligt.modbus.jlibmodbus.master.ModbusMaster;
import com.intelligt.modbus.jlibmodbus.master.ModbusMasterFactory;
import com.intelligt.modbus.jlibmodbus.tcp.TcpParameters;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.net.UnknownHostException;

import static org.opfab.externaldevices.drivers.ModbusDriver.RESPONSE_TIMEOUT;

@Component
@Slf4j
public class ModbusDriverFactory implements ExternalDeviceDriverFactory {

    @Override
    public ExternalDeviceDriver create(String host, int port) throws ExternalDeviceDriverException {

        try {
            InetAddress resolvedHost = InetAddress.getByName(host);

            // The ModbusMaster creation is handled here rather than in the ModbusDriver constructor so it can be mocked
            // in the tests.
            TcpParameters tcpParameters = new TcpParameters();
            tcpParameters.setHost(resolvedHost);
            tcpParameters.setPort(port);
            tcpParameters.setKeepAlive(true);
            log.debug("Creating ModbusMaster with host {} and port {}",tcpParameters.getHost(),tcpParameters.getPort());
            Modbus.setLogLevel(Modbus.LogLevel.LEVEL_DEBUG);
            Modbus.setAutoIncrementTransactionId(true);
            ModbusMaster modbusMaster = ModbusMasterFactory.createModbusMasterTCP(tcpParameters);
            modbusMaster.setResponseTimeout(RESPONSE_TIMEOUT);

            return new ModbusDriver(resolvedHost,port,modbusMaster);

        } catch (UnknownHostException e) {
            throw new ExternalDeviceDriverException("Unable to initialize ModbusDriver with host "+ host, e);
        }
    }
}