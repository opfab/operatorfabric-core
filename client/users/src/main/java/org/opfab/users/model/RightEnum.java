/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.users.model;

// This enum does not use upperCase for historical reasons
// changing it would break the API and necessitate a database migration for production deployments
@SuppressWarnings("squid:S115")
public enum RightEnum {
    Receive,
    ReceiveAndWrite
}