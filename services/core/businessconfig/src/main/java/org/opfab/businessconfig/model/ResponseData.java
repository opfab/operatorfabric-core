/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
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

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>Detail Model, documented at {@link Response}</p>
 *
 * {@inheritDoc}
 *
 *
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponseData implements Response {

    private Boolean lock;
    private String state;
    private ResponseBtnColorEnum btnColor;
    private I18n btnText;
    private List<String> externalRecipients;

    @Override
    public void setExternalRecipients(List<String> externalRecipients) {
        this.externalRecipients = new ArrayList<>(externalRecipients);
    }

    @Override
    public List<String> getExternalRecipients() {
        if (externalRecipients == null)
            return Collections.emptyList();
        return externalRecipients;
    }
}
