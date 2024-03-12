/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.model;

import org.springframework.data.annotation.Id;

import jakarta.validation.constraints.NotNull;

public class Device{

    @Id
    @NotNull
    public String id;

    @NotNull
    public String resolvedAddress;

    @NotNull
    public Integer port;

    @SuppressWarnings("java:S1104") // This is just a data object
    public Boolean isConnected = false;

}
