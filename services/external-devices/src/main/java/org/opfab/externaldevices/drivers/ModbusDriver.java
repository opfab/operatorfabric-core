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

/** This class transforms requests to trigger sound notifications into calls to the external device
 * */
@Slf4j
@Getter
@ToString
public class ModbusDriver implements ExternalDeviceDriver {

    private InetAddress resolvedHost;
    private int port;
    private ModbusMaster modbusMaster;

    static final int RESPONSE_TIMEOUT = 10000;
    static final int TRIGGER_VALUE = 1;
    static final String SENDING_REQUEST = "Sending write request for register {} on {}:{} (transactionId {})";
    static final String SENT_REQUEST = "Write request was sent for register {} on {}:{} (transactionId {})";

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
            throw new ExternalDeviceDriverException("Error during ModbusDriver disconnection from "+this.resolvedHost +":"+this.port , e);
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
            //Ideally, the debug logs below would have gotten their transactionId from the request and response objects
            //so they could be matched. Unfortunately, the getTransactionId method doesn't really work on these objects
            //in BROADCAST mode, and always return 0.
            //Calling it on the modbusMaster however, correctly returns the current transactionId (i.e. the id of the
            //last transaction it handled). So using transactionId+1 before the request is sent, and transactionId after,
            //should allow to match the two lines as the send method is synchronized.
            log.debug(SENDING_REQUEST,registerAddress,getResolvedHost().getHostAddress(),getPort(),modbusMaster.getTransactionId()+1);
            modbusMaster.processRequest(request);
            log.debug(SENT_REQUEST,registerAddress,getResolvedHost().getHostAddress(),getPort(),modbusMaster.getTransactionId());
        } catch (ModbusProtocolException | ModbusNumberException | ModbusIOException e) {
            throw new ExternalDeviceDriverException("Unable to write value on register "+registerAddress , e);
        }
    }

    @Override
    public boolean isConnected() {
        return modbusMaster.isConnected();
    }

}
