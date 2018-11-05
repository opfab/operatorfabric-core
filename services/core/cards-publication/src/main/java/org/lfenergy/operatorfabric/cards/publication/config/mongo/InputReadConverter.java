/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.publication.config.mongo;

import org.bson.Document;
import org.lfenergy.operatorfabric.cards.model.InputEnum;
import org.lfenergy.operatorfabric.cards.publication.model.Input;
import org.lfenergy.operatorfabric.cards.publication.model.InputPublicationData;
import org.springframework.core.convert.converter.Converter;

import java.util.Collection;
import java.util.List;

/**
 *
 * <p>Spring converter registered in mongo conversions</p>
 * <p>Converts {@link Document} to {@link Input} using {@link InputPublicationData.InputPublicationDataBuilder}</p>
 *
 * @author David Binder
 */
public class InputReadConverter implements Converter<Document,Input> {

    private I18nReadConverter i18nReadConverter = new I18nReadConverter();
    private ParameterListItemReadConverter parameterListItemReadConverter = new ParameterListItemReadConverter();
    @Override
    public Input convert(Document source) {
        InputPublicationData.InputPublicationDataBuilder builder = InputPublicationData.builder()
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
