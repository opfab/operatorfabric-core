/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.model;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

@Builder
public record CardsFilter(BigDecimal page, BigDecimal size, Boolean adminMode, Boolean includeChildCards,
        Boolean latestUpdateOnly, List<FilterModel> filters, List<String> selectedFields) {

    public CardsFilter {
        adminMode = adminMode != null && adminMode;
        includeChildCards = includeChildCards != null && includeChildCards;
        latestUpdateOnly = latestUpdateOnly != null && latestUpdateOnly;
    }
}
