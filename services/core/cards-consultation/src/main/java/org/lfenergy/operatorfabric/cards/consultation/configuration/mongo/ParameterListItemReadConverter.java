
package org.lfenergy.operatorfabric.cards.consultation.configuration.mongo;

import org.bson.Document;
import org.lfenergy.operatorfabric.cards.consultation.model.ParameterListItem;
import org.lfenergy.operatorfabric.cards.consultation.model.ParameterListItemConsultationData;
import org.springframework.core.convert.converter.Converter;

/**
 *
 * <p>Spring converter registered in mongo conversions</p>
 * <p>Converts {@link Document} to {@link ParameterListItem} using {@link ParameterListItemConsultationData} builder
 * .</p>
 *
 * @author David Binder
 */
public class ParameterListItemReadConverter implements Converter<Document,ParameterListItem> {

    private I18nReadConverter i18nReadConverter = new I18nReadConverter();

    @Override
    public ParameterListItem convert(Document source) {
        ParameterListItemConsultationData.ParameterListItemConsultationDataBuilder builder = ParameterListItemConsultationData.builder()
                .label(i18nReadConverter.convert((Document) source.get("label")))
                .value(source.getString("value"))
                ;
        return builder.build();
    }
}
