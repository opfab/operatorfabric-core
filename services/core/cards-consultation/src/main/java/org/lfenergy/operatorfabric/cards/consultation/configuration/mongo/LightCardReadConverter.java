/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.consultation.configuration.mongo;

import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.lfenergy.operatorfabric.cards.consultation.model.LightCard;
import org.lfenergy.operatorfabric.cards.consultation.model.LightCardConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.model.TimeSpanConsultationData;
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
    private TimeSpanReadConverter timeSpanConverter = new TimeSpanReadConverter();
    @Override
    public LightCard convert(Document source) {
        LightCardConsultationData.LightCardConsultationDataBuilder builder = LightCardConsultationData.builder();
        builder
                .publisher(source.getString("publisher"))
                .publisherVersion(source.getString("publisherVersion"))
                .uid(source.getString("uid"))
                .id(source.getString("_id"))
                .process(source.getString("process"))
                .state(source.getString("state"))
                .processId(source.getString("processId"))
                .lttd(source.getDate("lttd") == null ? null : source.getDate("lttd").toInstant())
                .startDate(source.getDate("startDate") == null ? null : source.getDate("startDate").toInstant())
                .endDate(source.getDate("endDate") == null ? null : source.getDate("endDate").toInstant())
                .publishDate(source.getDate("publishDate") == null ? null : source.getDate("publishDate").toInstant())
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

        List<String> tags = (List<String>) source.get("tags");
        if (tags != null)
            for (String t : tags) {
                builder.tag(t);
            }
        List<Document> timeSpans = (List<Document>) source.get("timeSpans");
        if (timeSpans != null)
            for (Document d : timeSpans) {
                builder.timeSpan((TimeSpanConsultationData)timeSpanConverter.convert(d));
            }
        return builder.build();
    }
}
