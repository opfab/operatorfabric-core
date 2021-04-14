/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.consultation.configuration.mongo;

import org.bson.Document;
import org.lfenergy.operatorfabric.cards.consultation.model.I18n;
import org.lfenergy.operatorfabric.cards.consultation.model.I18nConsultationData;
import org.springframework.core.convert.converter.Converter;

import java.util.Map;

/**
 *
 * <p>Spring converter registered in mongo conversions</p>
 * <p>Converts {@link Document} to {@link I18n} using {@link I18nConsultationData} builder.</p>
 *
 */
public class I18nReadConverter implements Converter<Document, I18n> {
    @Override
    public I18n convert(Document source) {
        I18nConsultationData.I18nConsultationDataBuilder builder = I18nConsultationData.builder().key( source.getString("key"));
        Document parameters = (Document) source.get("parameters");
        if(parameters!=null)
            for(Map.Entry<String,Object> e: parameters.entrySet()){
                builder.parameter(e.getKey(), (String) e.getValue());
            }

        return builder.build();
    }
}
