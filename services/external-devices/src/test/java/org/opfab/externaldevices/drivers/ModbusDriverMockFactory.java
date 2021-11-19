/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.drivers;

import org.springframework.data.util.Pair;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class ModbusDriverMockFactory implements ExternalDeviceDriverFactory {

    // This data simulates host resolution and the fact that only some ports correspond to listening devices on
    // the hosts.
    private static final Map<String, String> resolvableHosts = new HashMap<>();
    private static final List<Pair<String, Integer>> reachableDevices = new ArrayList<>();

    public ModbusDriverMockFactory() {

        this.reachableDevices.add(Pair.of("host1",1234));
        this.reachableDevices.add(Pair.of("host1",5678)); // Several ports can be open on a given host, representing different devices
        this.reachableDevices.add(Pair.of("host2",1234));

        // We have to provide the (fake) IPs because if we pass "host1" to InetAddress.getByName, it will attempt to
        // really resolve the host.
        this.resolvableHosts.put("host1","123.45.67.1");
        this.resolvableHosts.put("host2","123.45.67.2");
    }

    @Override
    public ExternalDeviceDriver create(String host, int port) throws ExternalDeviceDriverException {

        try {

            InetAddress resolvedHost = getByName(host);
            if(reachableDevices.stream().anyMatch(device -> device.getFirst().equals(host) && device.getSecond().equals(port))) {
                return new ModbusDriverMock(resolvedHost,port);
            } else {
                throw new ExternalDeviceDriverException("Unable to initialize ModbusDriverMock with host "+ host +", port "+port+".");
            }

        } catch (UnknownHostException e) {
            throw new ExternalDeviceDriverException("Unable to initialize ModbusDriverMock with host "+ host,e);
        }

    }

    private InetAddress getByName(String host) throws UnknownHostException {
        if(resolvableHosts.containsKey(host)) {
            return InetAddress.getByName(resolvableHosts.get(host));
        } else {
            throw new UnknownHostException();
        }
    }
}