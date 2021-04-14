/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.consultation.model;

import lombok.*;
import org.opfab.cards.model.RecipientEnum;

import java.util.List;

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>Recipient Model, documented at {@link Recipient}</p>
 *
 * {@inheritDoc}
 *
 *
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecipientConsultationData implements Recipient {
    private RecipientEnum type;
    private String identity;
    @Singular
    private List<? extends Recipient> recipients;
}
