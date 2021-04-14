/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.publication.configuration.mongo;

import org.bson.Document;
import org.opfab.cards.publication.model.Recurrence;
import org.opfab.cards.publication.model.RecurrencePublicationData;
import org.opfab.cards.publication.model.TimeSpan;
import org.springframework.core.convert.converter.Converter;

import java.time.Instant;
import java.util.Date;
/**
 *
 * <p>Spring converter to register {@link TimeSpan} in mongoDB</p>
 * <p>Converts {@link TimeSpan} to {@link Document} </p>
 * <p>Needed after upgrade to spring-boot 2.2.4.RELEASE</p>
 */
public class TimeSpanWriterConverter implements Converter<TimeSpan, Document> {

    @Override
    public Document convert(TimeSpan source) {
        Document result = new Document();

         Instant start = source.getStart();
        result.append("start", Date.from(start));
         Instant end = source.getEnd();
        if (end != null) {
            result.append("end", Date.from(end));
        }


        Recurrence recurrence = source.getRecurrence();
        if (recurrence!=null) result.append("recurrence",RecurrenceWriterConverter.convert((RecurrencePublicationData)recurrence));

        return result;

    }

}
