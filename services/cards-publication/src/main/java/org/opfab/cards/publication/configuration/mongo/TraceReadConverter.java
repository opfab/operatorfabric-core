package org.opfab.cards.publication.configuration.mongo;

import org.bson.Document;
import org.opfab.aop.process.mongo.models.UserActionTraceData;
import org.springframework.core.convert.converter.Converter;


public class TraceReadConverter implements Converter<Document, UserActionTraceData> {

    @Override
    public UserActionTraceData convert(Document source) {
        UserActionTraceData.UserActionTraceDataBuilder traceBuilder = UserActionTraceData.builder()
                .action(source.getString("action"))
                .cardUid(source.getString("cardUid"))
                .actionDate(source.getDate("actionDate").toInstant())
                .entities(source.getList("entities",String.class))
                .userName(source.getString("userName"));

        return traceBuilder.build();
    }
}
