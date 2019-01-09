/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.config.mongo;

import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.lfenergy.operatorfabric.cards.consultation.model.LightCard;
import org.lfenergy.operatorfabric.cards.consultation.model.LightCardConsultationData;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.springframework.core.convert.converter.Converter;

import java.util.List;

/**
 * <p>Spring converter registered in mongo conversions</p>
 * <p>Converts {@link Document} to {@link LightCard} using {@link LightCardConsultationData} builder.</p>
 *
 * @author David Binder
 */
@Slf4j
public class LightCardReadConverter implements Converter<Document, LightCard> {
    private I18nReadConverter i18nReadConverter = new I18nReadConverter();
    @Override
    public LightCard convert(Document source) {
        LightCardConsultationData.LightCardConsultationDataBuilder builder = LightCardConsultationData.builder();
        builder
                .publisher(source.getString("publisher"))
                .publisherVersion(source.getString("publisherVersion"))
                .uid(source.getString("uid"))
                .id(source.getString("_id"))
                .processId(source.getString("processId"))
                .lttd(source.getLong("lttd"))
                .startDate(source.getLong("startDate"))
                .endDate(source.getLong("endDate"))
                .severity(SeverityEnum.valueOf(source.getString("severity")))
                .media(source.getString("media"))
                .mainRecipient(source.getString("mainRecipient"))
        ;
        Document titleDoc = (Document) source.get("title");
        if(titleDoc!=null)
            builder.title(i18nReadConverter.convert(titleDoc));

        Document summaryDoc = (Document) source.get("summary");
        if(summaryDoc!=null)
            builder.summary(i18nReadConverter.convert(summaryDoc));

        List<String> tags = (List<String>) source.get("recipients");
        if (tags != null)
            for (String t : tags) {
                builder.tag(t);
            }
        return builder.build();
    }
}
