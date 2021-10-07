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
import com.intelligt.modbus.jlibmodbus.exception.ModbusIOException;
import com.intelligt.modbus.jlibmodbus.exception.ModbusNumberException;
import com.intelligt.modbus.jlibmodbus.exception.ModbusProtocolException;
import com.intelligt.modbus.jlibmodbus.master.ModbusMaster;
import com.intelligt.modbus.jlibmodbus.master.ModbusMasterFactory;
import com.intelligt.modbus.jlibmodbus.tcp.TcpParameters;
import lombok.extern.slf4j.Slf4j;

import java.net.InetAddress;
import java.net.UnknownHostException;

/** This class transforms requests to trigger sound notifications into calls to the external device
 * */
@Slf4j
public class ModbusDriver implements ExternalDeviceDriver {

    private InetAddress resolvedHost;
    private int port;

    static final int RESPONSE_TIMEOUT = 10000;
    static final int TRIGGER_VALUE = 1;

    private ModbusMaster modbusMaster;

    public ModbusDriver(String host, int port) throws ExternalDeviceDriverException {

        try {
            this.resolvedHost = InetAddress.getByName(host);
        } catch (UnknownHostException e) {
            throw new ExternalDeviceDriverException("Unable to initialize ModbusDriver with host "+host, e);
        }
        this.port = port;

        this.initModbusMaster();

    }

    private void initModbusMaster () throws ExternalDeviceDriverException{

        TcpParameters tcpParameters = new TcpParameters();

            tcpParameters.setHost(this.resolvedHost);
            tcpParameters.setPort(this.port);
            tcpParameters.setKeepAlive(true);
            log.debug("Creating ModbusMaster with host {} and port {}",tcpParameters.getHost(),tcpParameters.getPort());
            modbusMaster = ModbusMasterFactory.createModbusMasterTCP(tcpParameters);
            modbusMaster.setResponseTimeout(RESPONSE_TIMEOUT);
            Modbus.setLogLevel(Modbus.LogLevel.LEVEL_DEBUG); //TODO Make it configurable
            Modbus.setAutoIncrementTransactionId(true);


    }

    @Override
    public void connect () throws ExternalDeviceDriverException {
            try {
                modbusMaster.connect();
            } catch (ModbusIOException e) {
                throw new ExternalDeviceDriverException("Error during ModbusDriver connection to " + this.resolvedHost + ":" + this.port, e);
            }
    }

    @Override
    public void disconnect() throws ExternalDeviceDriverException {
        try {
            modbusMaster.disconnect();
        } catch (ModbusIOException e) {
            throw new ExternalDeviceDriverException("Error during ModbusDriver disconnection from "+this.resolvedHost +":"+this.port , e);
        }
    }

    @Override
    public void send(int signalId) throws ExternalDeviceDriverException {
        int registerAddress = signalId;
        int value = TRIGGER_VALUE;

        try {
            log.debug("ModbusDriver transaction id:"+modbusMaster.getTransactionId());
            modbusMaster.writeSingleRegister(Modbus.BROADCAST_ID, registerAddress, value);
        } catch (ModbusProtocolException | ModbusNumberException | ModbusIOException e) {
            throw new ExternalDeviceDriverException("Unable to write value on register "+registerAddress , e);
        }
    }

    @Override
    public boolean isConnected() {
        return modbusMaster.isConnected();
    }

    @Override
    public InetAddress getResolvedHost() {
        return resolvedHost;
    }

    @Override
    public int getPort() {
        return port;
    }

    @Override
    public String toString() {
        return "ModbusDriver{" +
                "resolvedHost=" + getResolvedHost() +
                ", port=" + getPort() +
                '}';
    }


}
