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
import org.lfenergy.operatorfabric.cards.consultation.model.TimeSpan;
import org.lfenergy.operatorfabric.cards.consultation.model.TimeSpanConsultationData;
import org.springframework.core.convert.converter.Converter;

import java.time.Instant;

/**
 *
 * <p>Spring converter registered in mongo conversions</p>
 * <p>Converts {@link Document} to {@link TimeSpan} using {@link TimeSpanConsultationData} builder</p>
 *
 */
public class TimeSpanReadConverter implements Converter<Document, TimeSpan> {

    
    @Override
    public TimeSpan convert(Document source) {
        Instant start = source.getDate("start") == null ? null : source.getDate("start").toInstant();
        Instant end = source.getDate("end") == null ? null : source.getDate("end").toInstant();
        TimeSpanConsultationData.TimeSpanConsultationDataBuilder builder = TimeSpanConsultationData.builder()
                .start(start)
                ;
        if(end!=null)
            builder.end(end);
        Document recurrence = (Document) source.get("recurrence");
        if (recurrence!=null)  builder.recurrence(RecurrenceReadConverter.convert(recurrence));   
        

        return builder.build();
    }
}
