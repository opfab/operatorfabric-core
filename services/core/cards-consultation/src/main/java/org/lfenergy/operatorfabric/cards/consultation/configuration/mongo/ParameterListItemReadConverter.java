/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.consultation.configuration.mongo;

import org.bson.Document;
import org.lfenergy.operatorfabric.cards.consultation.model.ParameterListItem;
import org.lfenergy.operatorfabric.cards.consultation.model.ParameterListItemConsultationData;
import org.springframework.core.convert.converter.Converter;

/**
 *
 * <p>Spring converter registered in mongo conversions</p>
 * <p>Converts {@link Document} to {@link ParameterListItem} using {@link ParameterListItemConsultationData} builder
 * .</p>
 *
 */
public class ParameterListItemReadConverter implements Converter<Document,ParameterListItem> {

    private I18nReadConverter i18nReadConverter = new I18nReadConverter();

    @Override
    public ParameterListItem convert(Document source) {
        ParameterListItemConsultationData.ParameterListItemConsultationDataBuilder builder = ParameterListItemConsultationData.builder()
                .label(i18nReadConverter.convert((Document) source.get("label")))
                .value(source.getString("value"))
                ;
        return builder.build();
    }
}
