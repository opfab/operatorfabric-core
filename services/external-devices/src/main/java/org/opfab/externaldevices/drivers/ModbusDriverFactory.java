/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.drivers;

import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.net.UnknownHostException;

@Component
public class ModbusDriverFactory implements ExternalDeviceDriverFactory {

    @Override
    public ExternalDeviceDriver create(String host, int port) throws ExternalDeviceDriverException {

        try {
            InetAddress resolvedHost = InetAddress.getByName(host);
            return new ModbusDriver(resolvedHost,port);
        } catch (UnknownHostException e) {
            throw new ExternalDeviceDriverException("Unable to initialize ModbusDriver with host "+ host, e);
        }
    }
}