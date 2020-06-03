/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.lfenergy.operatorfabric.actions.model;

import lombok.*;

import javax.validation.constraints.NotNull;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class I18nData implements I18n {
    @NotNull
    private String key;
    @Singular
    private Map<String,String> parameters;
}
