/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.publication.model;

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
public class RecipientPublicationData implements Recipient {
    private RecipientEnum type;
    private String identity;
    @Singular
    private List<? extends Recipient> recipients;

    public static RecipientPublicationData union(Recipient... recipients) {
        RecipientPublicationData.RecipientPublicationDataBuilder result = RecipientPublicationData.builder()
           .type(RecipientEnum.UNION);
        for(Recipient r : recipients)
            result.recipient(r);
        return result.build();
    }

    public static RecipientPublicationData matchGroup(String group) {
        return RecipientPublicationData.builder()
           .type(RecipientEnum.GROUP)
           .identity(group)
           .build();
    }

    public static RecipientPublicationData matchUser(String user) {
        return RecipientPublicationData.builder()
           .type(RecipientEnum.USER)
           .identity(user)
           .build();
    }
}
