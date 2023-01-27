/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.model;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class UserActionLogPageData implements UserActionLogPage {
    private List<UserActionLog> content;

    private Boolean first;

    private Boolean last;

    private BigDecimal totalPages;

    private BigDecimal totalElements;

    private BigDecimal numberOfElements;

    private BigDecimal size;

    private BigDecimal number;


}
