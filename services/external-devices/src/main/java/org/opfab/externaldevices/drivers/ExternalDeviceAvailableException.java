/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.drivers;

/** This exception should be thrown when trying to connect an external device
 *  when this latter is disabled */
public class ExternalDeviceAvailableException extends Exception {

    public ExternalDeviceAvailableException(String message) {
        super(message);
    }

}
