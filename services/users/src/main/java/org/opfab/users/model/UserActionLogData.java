/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserActionLogData implements UserActionLog
{
    private Instant date;
    private String login;
    private List<String> entities;
    private String action;
    private String cardUid;
    private String comment;

    public UserActionLogData(org.opfab.useractiontracing.model.UserActionLog userAction) {
        this.login = userAction.getLogin();
        this.date = userAction.getDate();
        this.entities = userAction.getEntities();
        this.action = userAction.getAction().name();
        this.comment = userAction.getComment();
        this.cardUid = userAction.getCardUid();
    }
}
