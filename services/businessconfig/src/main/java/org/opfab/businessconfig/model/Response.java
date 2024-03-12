/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.businessconfig.model;

import java.util.Collections;
import java.util.List;

import org.springframework.validation.annotation.Validated;

@Validated
public record Response(
        Boolean lock,
        String state,
        List<String> externalRecipients,
        Boolean emittingEntityAllowedToRespond) {

    public Response {
        if (emittingEntityAllowedToRespond == null)
            emittingEntityAllowedToRespond = false;
    }

    @SuppressWarnings("java:S6207")
    // Sonar states that this method is redundant as is it the same as the default
    // one but it is not as the default one does not return an empty list but null
    // when value is null
    public List<String> externalRecipients() {
        if (externalRecipients == null)
            return Collections.emptyList();
        return externalRecipients;
    }
}
