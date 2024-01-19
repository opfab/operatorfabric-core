/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.businessconfig.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.validation.annotation.Validated;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Validated
public class Response {

    private Boolean lock;
    private String state;
    private List<String> externalRecipients;
    @Builder.Default
    private Boolean emittingEntityAllowedToRespond = false;

    public void setExternalRecipients(List<String> externalRecipients) {
        this.externalRecipients = new ArrayList<>(externalRecipients);
    }

    public List<String> getExternalRecipients() {
        if (externalRecipients == null)
            return Collections.emptyList();
        return externalRecipients;
    }
}
