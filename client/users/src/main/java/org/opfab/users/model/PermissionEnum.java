/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.users.model;

/**
 * Note : This enum is created by hand because Swagger can't handle enums. It should match the corresponding enum definition in the Users API.
 *
 */
public enum PermissionEnum {
    ADMIN,
    ADMIN_BUSINESS_PROCESS,
    VIEW_ALL_ARCHIVED_CARDS,
    VIEW_ALL_ARCHIVED_CARDS_FOR_USER_PERIMETERS,
    VIEW_ALL_CARDS,
    VIEW_ALL_CARDS_FOR_USER_PERIMETERS,
    VIEW_USER_ACTION_LOGS,
    READONLY;
}