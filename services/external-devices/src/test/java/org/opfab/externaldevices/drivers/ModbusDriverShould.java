/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.drivers;

import com.intelligt.modbus.jlibmodbus.exception.ModbusIOException;
import com.intelligt.modbus.jlibmodbus.exception.ModbusNumberException;
import com.intelligt.modbus.jlibmodbus.exception.ModbusProtocolException;
import com.intelligt.modbus.jlibmodbus.master.ModbusMaster;
import com.intelligt.modbus.jlibmodbus.msg.request.WriteSingleRegisterRequest;
import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;

import java.net.InetAddress;
import java.net.UnknownHostException;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
@Slf4j
public class ModbusDriverShould {

    private static ModbusDriverFactory modbusDriverFactory;
    private ModbusMaster modbusMaster;
    private ModbusDriver modbusDriver;

    @BeforeAll
    public static void setUp() {
        modbusDriverFactory = new ModbusDriverFactory();
    }

    @BeforeEach
    public void initDriver() throws UnknownHostException {
        modbusMaster = mock(ModbusMaster.class);
        modbusDriver = new ModbusDriver(InetAddress.getByName("123.45.67.1"),123,modbusMaster);
    }

    @Test
    void modbusDriverShouldConnect() throws ExternalDeviceDriverException, ModbusIOException {

        modbusDriver.connect();
        verify(modbusMaster,times(1)).connect();
        // We can't check the case where an exception is thrown by modbusMaster.connect() because it's a final method (Mockito limitation)
    }

    @Test
    void modbusDriverShouldDisconnect() throws ExternalDeviceDriverException, ModbusIOException {

        modbusDriver.disconnect();
        verify(modbusMaster,times(1)).disconnect();
        // We can't check the case where an exception is thrown by modbusMaster.disconnect() because it's a final method (Mockito limitation)
    }

    @Test
    void modbusDriverShouldBeConnectedIfModbusMasterIsConnected() {

        when(modbusMaster.isConnected()).thenReturn(true);
        Assertions.assertThat(modbusDriver.isConnected()).isTrue();
        verify(modbusMaster,times(1)).isConnected();

    }

    @Test
    void modbusDriverShouldBeDisconnectedIfModbusMasterIsDisconnected() {

        when(modbusMaster.isConnected()).thenReturn(false);
        Assertions.assertThat(modbusDriver.isConnected()).isFalse();
        verify(modbusMaster,times(1)).isConnected();

    }

    @Test
    void modbusDriverShouldSendSignal() throws ModbusProtocolException, ModbusIOException, ExternalDeviceDriverException {

        int signalId = 3;
        ArgumentCaptor<WriteSingleRegisterRequest> requestCaptor = ArgumentCaptor.forClass(WriteSingleRegisterRequest.class);

        modbusDriver.send(signalId);

        // Check that the modbusMaster was asked to process a request of the correct type and with a start address
        // corresponding to the signalId that was passed to the modbusDriver
        verify(modbusMaster,times(1)).processRequest(requestCaptor.capture());
        Assertions.assertThat(requestCaptor.getValue().getStartAddress()).isEqualTo(signalId);

    }

    @Test
    void modbusDriverShouldThrowIfModbusMasterCantSend() throws ModbusProtocolException, ModbusIOException {

        int signalId = 3;

        when(modbusMaster.processRequest(any())).thenThrow(ModbusIOException.class);
        assertThrows(ExternalDeviceDriverException.class, () -> modbusDriver.send(signalId));

    }


}
