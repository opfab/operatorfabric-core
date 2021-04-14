/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.aop.process;

public enum AopTraceType {

    ACK("Acknowledgment");

    private String action;

    AopTraceType(String action) {
        this.action =action;
    }

    // getter method
    public String getAction()
    {
        return this.action;
    }
}
