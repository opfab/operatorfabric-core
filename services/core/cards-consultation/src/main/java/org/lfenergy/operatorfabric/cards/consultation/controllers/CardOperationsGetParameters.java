/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.controllers;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Value;
import org.lfenergy.operatorfabric.users.model.User;

@Value
@Builder
@AllArgsConstructor
public class CardOperationsGetParameters {
    private boolean test;
    private boolean notification;
    private String clientId;
    private Long rangeStart;
    private Long rangeEnd;
    private User user;

}
