package org.lfenergy.operatorfabric.cards.consultation.config.mongo;

import org.bson.Document;
import org.lfenergy.operatorfabric.cards.consultation.model.Action;
import org.lfenergy.operatorfabric.cards.consultation.model.ActionConsultationData;
import org.lfenergy.operatorfabric.cards.model.ActionEnum;
import org.springframework.core.convert.converter.Converter;

import java.util.List;

/**
 *
 * <p>Spring converter registered in mongo conversions</p>
 * <p>Converts {@link Document} to {@link Action} using {@link ActionConsultationData} builder.</p>
 *
 * @author David Binder
 */
public class ActionReadConverter implements Converter<Document,Action> {

    private I18nReadConverter i18nReadConverter = new I18nReadConverter();
    private InputReadConverter inputReadConverter = new InputReadConverter();

    @Override
    public Action convert(Document source) {
        ActionConsultationData.ActionConsultationDataBuilder builder = ActionConsultationData.builder()
                .type(ActionEnum.valueOf(source.getString("type")))
                .label(i18nReadConverter.convert((Document) source.get("label")))
                .buttonStyle(source.getString("buttonStyle"))
                .called(source.getBoolean("called"))
                .contentStyle(source.getString("contentStyle"))
                .hidden(source.getBoolean("hidden"))
                .lockAction(source.getBoolean("lockAction"))
                .lockCard(source.getBoolean("lockCard"))
                .needsConfirm(source.getBoolean("needsConfirm"))
                .updateState(source.getBoolean("updateState"))
                .updateStateBeforeAction(source.getBoolean("updateStateBeforeAction"))
                ;
        List<Document> inputs = (List<Document>) source.get("inputs");
        if(inputs!=null){
            for(Document d : inputs){
                builder.input(inputReadConverter.convert(d));
            }
        }

        return builder.build();
    }
}
