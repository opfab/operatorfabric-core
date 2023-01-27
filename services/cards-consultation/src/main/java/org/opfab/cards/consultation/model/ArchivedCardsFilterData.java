/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArchivedCardsFilterData implements ArchivedCardsFilter {

    private BigDecimal page;
    private BigDecimal size;
    @Builder.Default
    private Boolean adminMode = false;
    @Builder.Default
    private Boolean includeChildCards = false;
    @Builder.Default
    private Boolean latestUpdateOnly = false;
    private List<FilterModel> filters;

    public void setAdminMode(Boolean adminMode) {
        this.adminMode = adminMode != null && adminMode;
    }

    public Boolean getAdminMode() {
        return this.adminMode;
    }

    public void setIncludeChildCards(Boolean includeChildCards) {
        this.includeChildCards = includeChildCards != null && includeChildCards;
    }

    public Boolean getIncludeChildCards() {
        return this.includeChildCards;
    }

    public void setLatestUpdateOnly(Boolean latestUpdateOnly) {
        this.latestUpdateOnly = latestUpdateOnly != null && latestUpdateOnly;
    }

    public Boolean getLatestUpdateOnly() {
        return this.latestUpdateOnly;
    }
}
