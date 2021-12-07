/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.drivers;

import java.net.InetAddress;

/**
 * This interface lists the operations that need to be supported by any driver that could be used to communicate
 * with an external device (currently, the only implementation is ModbusDriver
 * The aim of driver classes is manage connection to and disconnection from the physical devices, and to perform
 * the actual sending of the signal over these connections.
 * */
public interface ExternalDeviceDriver {

    void connect () throws ExternalDeviceDriverException;

    void disconnect() throws ExternalDeviceDriverException;

    void send(int signalId) throws ExternalDeviceDriverException;

    boolean isConnected();

    // While the DeviceConfiguration object specifies a host as a String that can be a hostname or an IP, a driver
    // has an InetAddress because the connection is attached to an actual resolved address. If the resolved address
    // for a hostname changes over time, the outdated driver will be disconnected and removed from the pool, and a
    // new one will be created.
    InetAddress getResolvedHost();

    int getPort();

}