/* Copyright (c) 2022-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.useractiontracing.model;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "userActionLogs")
@SuppressWarnings("java:S1104") // it is just a data object , we choose to have all fields public for simplicity
public class UserActionLog {
    @Indexed
    public Instant date;
    @Indexed
    public String login;
    public List<String> entities;
    @Indexed
    public UserActionEnum action;
    public String cardUid;
    public String comment;

}
