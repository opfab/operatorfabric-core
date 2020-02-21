/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.publication.configuration.mongo;

import org.bson.Document;
import org.lfenergy.operatorfabric.cards.model.TimeSpanDisplayModeEnum;
import org.lfenergy.operatorfabric.cards.publication.model.TimeSpan;
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
         TimeSpanDisplayModeEnum display = source.getDisplay();
        if (display != null) {
            result.append("display", display.toString());
        }
        return result;

    }

}
