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

public interface ExternalDeviceDriver {

    void connect () throws ExternalDeviceDriverException;

    void disconnect() throws ExternalDeviceDriverException;

    void send(int signalId) throws ExternalDeviceDriverException;

    boolean isConnected();

    InetAddress getResolvedHost();

    int getPort();

}