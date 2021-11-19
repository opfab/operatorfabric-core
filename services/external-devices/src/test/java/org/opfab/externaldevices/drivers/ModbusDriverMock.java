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

import java.net.InetAddress;

@Slf4j
public class ModbusDriverMock implements ExternalDeviceDriver {

    private InetAddress resolvedHost;
    private int port;

    boolean isConnected;

    protected ModbusDriverMock(InetAddress resolvedHost, int port) {
        this.resolvedHost = resolvedHost;
        this.port = port;
        this.isConnected = false;
    }

    @Override
    public void connect() throws ExternalDeviceDriverException {
        this.isConnected = true;
    }

    @Override
    public void disconnect() throws ExternalDeviceDriverException {
        this.isConnected = false;
    }

    @Override
    public void send(int signalId) throws ExternalDeviceDriverException {
        if(!this.isConnected) {
            throw new ExternalDeviceDriverException("ModbusDriverMock "+this.toString()+" coundn't send signalId "+signalId+": driver is not connected.");
        }
    }

    @Override
    public boolean isConnected() {
        return isConnected;
    }

    @Override
    public InetAddress getResolvedHost() {
        return this.resolvedHost;
    }

    @Override
    public int getPort() {
        return this.port;
    }

    @Override
    public String toString() {
        return "ModbusDriverMock{" +
                "resolvedHost=" + resolvedHost +
                ", port=" + port +
                ", isConnected=" + isConnected +
                '}';
    }
}

