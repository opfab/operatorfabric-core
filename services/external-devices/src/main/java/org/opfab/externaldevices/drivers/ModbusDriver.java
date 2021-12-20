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
import com.intelligt.modbus.jlibmodbus.msg.request.WriteSingleRegisterRequest;
import lombok.Getter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;

import java.net.InetAddress;

@Slf4j
@Getter
@ToString
public class ModbusDriver implements ExternalDeviceDriver {

    private InetAddress resolvedHost;
    private int port;
    @ToString.Exclude private ModbusMaster modbusMaster;

    static final int TRIGGER_VALUE = 1;
    static final String SENDING_REQUEST = "Sending write request for register {}, value {} on {}";

    protected ModbusDriver(InetAddress resolvedHost, int port, ModbusMaster modbusMaster) {

        this.resolvedHost = resolvedHost;
        this.port = port;
        this.modbusMaster = modbusMaster;

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
            throw new ExternalDeviceDriverException("Error during ModbusDriver disconnection from "+this.resolvedHost +":"+this.port, e);
        }
    }

    @Override
    public synchronized void send(int signalId) throws ExternalDeviceDriverException {
        int registerAddress = signalId;
        int value = TRIGGER_VALUE;

        try {
            WriteSingleRegisterRequest request = new WriteSingleRegisterRequest();
            request.setServerAddress(Modbus.BROADCAST_ID);
            request.setStartAddress(registerAddress);
            request.setValue(value);
            log.debug(SENDING_REQUEST,registerAddress,value,getResolvedHost().getHostAddress(),getPort());
            modbusMaster.processRequest(request);
            // In broadcast mode, the Modbus device doesn't send a response (because in the case where there are
            // really several devices receiving the broadcast, the master would be flooded with responses for a single
            // request). However, it means that if there is a problem on the device while processing the request (for
            // example, attempting to write outside of the allowed registers), no exception will be thrown.
        } catch (ModbusIOException e) {
            // If something is wrong with the connection, an ModbusIOException will be thrown
            throw new ExternalDeviceDriverException("Unable to write value on register "+registerAddress ,e);
        } catch (ModbusProtocolException | ModbusNumberException e) {
            // Judging by the code for the processRequest method, these exceptions will never be thrown in broadcast mode
            throw new ExternalDeviceDriverException("Unexpected in broadcast mode - Unable to write value on register "+registerAddress ,e);
        }
    }

    @Override
    public boolean isConnected() {
        return modbusMaster.isConnected();
    }

}
