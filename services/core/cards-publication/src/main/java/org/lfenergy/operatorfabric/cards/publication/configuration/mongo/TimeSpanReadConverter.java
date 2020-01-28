
package org.lfenergy.operatorfabric.cards.publication.configuration.mongo;

import org.bson.Document;
import org.lfenergy.operatorfabric.cards.model.TimeSpanDisplayModeEnum;
import org.lfenergy.operatorfabric.cards.publication.model.TimeSpan;
import org.lfenergy.operatorfabric.cards.publication.model.TimeSpanPublicationData;
import org.springframework.core.convert.converter.Converter;

import java.time.Instant;

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
        Instant start = source.getDate("start") == null ? null : source.getDate("start").toInstant();
        Instant end = source.getDate("end") == null ? null : source.getDate("end").toInstant();
        TimeSpanPublicationData.TimeSpanPublicationDataBuilder builder = TimeSpanPublicationData.builder()
                .start(start)
                ;
        String stringDisplay = source.getString("display");
        if(end!=null)
            builder.end(end);
        if(stringDisplay != null)
            builder.display(TimeSpanDisplayModeEnum.valueOf(stringDisplay));

        return builder.build();
    }
}
