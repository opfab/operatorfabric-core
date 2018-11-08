package org.lfenergy.operatorfabric.cards.consultation.config.mongo;

import org.bson.Document;
import org.lfenergy.operatorfabric.cards.consultation.model.Input;
import org.lfenergy.operatorfabric.cards.consultation.model.InputConsultationData;
import org.lfenergy.operatorfabric.cards.model.InputEnum;
import org.springframework.core.convert.converter.Converter;

import java.util.Collection;
import java.util.List;

/**
 *
 * <p>Spring converter registered in mongo conversions</p>
 * <p>Converts {@link Document} to {@link Input} using {@link InputConsultationData} builder.</p>
 *
 * @author David Binder
 */
public class InputReadConverter implements Converter<Document,Input> {

    private I18nReadConverter i18nReadConverter = new I18nReadConverter();
    private ParameterListItemReadConverter parameterListItemReadConverter = new ParameterListItemReadConverter();
    @Override
    public Input convert(Document source) {
        InputConsultationData.InputConsultationDataBuilder builder = InputConsultationData.builder()
                .type(InputEnum.valueOf(source.getString("type")))
                .label(i18nReadConverter.convert((Document) source.get("label")))
                .mandatory(source.getBoolean("mandatory"))
                .maxLength(source.getInteger("maxLength"))
                .name(source.getString("name"))
                .rows(source.getInteger("rows"))
                .value(source.getString("value"))
                .selectedValues((Collection<? extends String>) source.get("selectedValues"))
                .unSelectedValues((Collection<? extends String>) source.get("unSelectedValues"))
                ;
        List<Document> valuesDocument = (List<Document>) source.get("values");
        if(valuesDocument != null){
            for(Document d : valuesDocument){
                builder.value(parameterListItemReadConverter.convert(d));
            }
        }
        return builder.build();
    }
}
