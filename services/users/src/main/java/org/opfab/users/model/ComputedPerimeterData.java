/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
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

/**
 * ComputedPerimeter Model, documented at {@link ComputedPerimeter}
 *
 * {@inheritDoc}
 *
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ComputedPerimeterData implements ComputedPerimeter {
    private String process;
    private String state;
    private RightsEnum rights;
}
