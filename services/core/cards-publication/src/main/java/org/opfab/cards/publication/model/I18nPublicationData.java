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

import java.util.Map;

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>I18n Model, documented at {@link I18n}</p>
 *
 * {@inheritDoc}
 *
 *
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class I18nPublicationData implements I18n {
    
    private String key;
    @Singular private Map<String,String> parameters;

    public I18n copy(){
        I18nPublicationDataBuilder builder = I18nPublicationData.builder()
                .key(this.getKey());
        if(this.getParameters()!=null && !this.getParameters().isEmpty()) {
           builder.parameters(this.getParameters());
        }
        return builder.build();
    }
}
