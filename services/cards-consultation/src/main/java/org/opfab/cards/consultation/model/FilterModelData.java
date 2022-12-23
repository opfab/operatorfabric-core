/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.cards.consultation.model;

import org.opfab.cards.model.FilterOperationTypeEnum;

import java.util.List;

import org.opfab.cards.model.FilterMatchTypeEnum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FilterModelData implements FilterModel {
    private String columnName;
    private String filterType;
    private FilterMatchTypeEnum matchType;
    private List<String> filter;
    private FilterOperationTypeEnum operation;
}
