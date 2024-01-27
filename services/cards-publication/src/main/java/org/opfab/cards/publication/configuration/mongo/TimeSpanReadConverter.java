/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
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
import org.opfab.cards.publication.model.TimeSpan;
import org.springframework.core.convert.converter.Converter;

import java.time.Instant;

public class TimeSpanReadConverter implements Converter<Document, TimeSpan> {

    @Override
    public TimeSpan convert(Document source) {
        // start date is mandatory , if it is null we set it to 0 (1970-01-01T00:00:00Z)
        // however this should not arise as card are not published if start date is not set
        Instant start = getInstantFromDocument(source, "start", Instant.ofEpochMilli(0));
        Instant end = getInstantFromDocument(source, "end", null);
        Recurrence recurrence = getRecurrenceFromDocument(source);

        return new TimeSpan(start, end, recurrence);
    }

    private Instant getInstantFromDocument(Document source, String key, Instant defaultValue) {
        return source.getDate(key) == null ? defaultValue : source.getDate(key).toInstant();
    }

    private Recurrence getRecurrenceFromDocument(Document source) {
        Document recurrenceDoc = (Document) source.get("recurrence");
        return recurrenceDoc != null ? RecurrenceReadConverter.convert(recurrenceDoc) : null;
    }
}
