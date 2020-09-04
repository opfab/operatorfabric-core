/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
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
 */
@Slf4j
public class LightCardReadConverter implements Converter<Document, LightCardConsultationData> {
    private I18nReadConverter i18nReadConverter = new I18nReadConverter();
    private TimeSpanReadConverter timeSpanConverter = new TimeSpanReadConverter();
    @Override
    public LightCardConsultationData convert(Document source) {
        LightCardConsultationData.LightCardConsultationDataBuilder builder = LightCardConsultationData.builder();
        builder
                .publisher(source.getString("publisher"))
                .parentCardUid(source.getString("parentCardUid"))
                .processVersion(source.getString("processVersion"))
                .uid(source.getString("uid"))
                .id(source.getString("_id"))
                .process(source.getString("process"))
                .state(source.getString("state"))
                .processInstanceId(source.getString("processInstanceId"))
                .lttd(source.getDate("lttd") == null ? null : source.getDate("lttd").toInstant())
                .startDate(source.getDate("startDate") == null ? null : source.getDate("startDate").toInstant())
                .endDate(source.getDate("endDate") == null ? null : source.getDate("endDate").toInstant())
                .publishDate(source.getDate("publishDate") == null ? null : source.getDate("publishDate").toInstant())
                .severity(SeverityEnum.valueOf(source.getString("severity")))
                .usersAcks(source.getList("usersAcks", String.class));

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
        List<String> entitiesAllowedToRespond = (List<String>) source.get("entitiesAllowedToRespond");
        if (entitiesAllowedToRespond != null){
            for (String entities : entitiesAllowedToRespond) {
                builder.tag(entities);
            }
        }
        List<Document> timeSpans = (List<Document>) source.get("timeSpans");
        if (timeSpans != null)
            for (Document d : timeSpans) {
                builder.timeSpan((TimeSpanConsultationData)timeSpanConverter.convert(d));
            }
        return builder.build();
    }
}
