/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.publication.configuration.mongo;

import org.bson.Document;
import org.opfab.cards.publication.model.TimeSpan;
import org.opfab.cards.publication.model.TimeSpanPublicationData;
import org.springframework.core.convert.converter.Converter;

import java.time.Instant;

/**
 *
 * <p>Spring converter registered in mongo conversions</p>
 * <p>Converts {@link Document} to {@link TimeSpan} using {@link TimeSpanPublicationData} builder</p>
 *
 *
 */
public class TimeSpanReadConverter implements Converter<Document, TimeSpan> {


    @Override
    public TimeSpan convert(Document source) {
        Instant start = source.getDate("start") == null ? null : source.getDate("start").toInstant();
        Instant end = source.getDate("end") == null ? null : source.getDate("end").toInstant();
        TimeSpanPublicationData.TimeSpanPublicationDataBuilder builder = TimeSpanPublicationData.builder()
                .start(start)
                ;
        if(end!=null)
            builder.end(end);

        Document recurrence = (Document) source.get("recurrence");
        if (recurrence!=null) builder.recurrence(RecurrenceReadConverter.convert(recurrence));   

        return builder.build();
    }
}
