/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.publication.configuration.mongo;

import org.bson.Document;
import org.lfenergy.operatorfabric.cards.model.TimeSpanDisplayModeEnum;
import org.lfenergy.operatorfabric.cards.publication.model.TimeSpan;
import org.lfenergy.operatorfabric.cards.publication.model.TimeSpanPublicationData;
import org.springframework.core.convert.converter.Converter;

/**
 *
 * <p>Spring converter registered in mongo conversions</p>
 * <p>Converts {@link Document} to {@link TimeSpan} using {@link TimeSpanPublicationData} builder</p>
 *
 * @author David Binder
 */
public class TimeSpanReadConverter implements Converter<Document, TimeSpan> {


    @Override
    public TimeSpan convert(Document source) {
        TimeSpanPublicationData.TimeSpanPublicationDataBuilder builder = TimeSpanPublicationData.builder()
                .start(source.getLong("start"))
                ;
        Long end = source.getLong("end");
        String stringDisplay = source.getString("display");
        if(end!=null)
            builder.end(end);
        if(stringDisplay != null)
            builder.display(TimeSpanDisplayModeEnum.valueOf(stringDisplay));

        return builder.build();
    }
}
