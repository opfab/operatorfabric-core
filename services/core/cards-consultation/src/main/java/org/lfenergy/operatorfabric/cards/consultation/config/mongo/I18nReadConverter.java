/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.consultation.config.mongo;

import org.bson.Document;
import org.lfenergy.operatorfabric.cards.consultation.model.I18nData;
import org.lfenergy.operatorfabric.cards.model.I18n;
import org.springframework.core.convert.converter.Converter;

import java.util.Map;

/**
 * <p></p>
 * Created on 31/07/18
 *
 * @author davibind
 */
public class I18nReadConverter implements Converter<Document, I18n> {
    @Override
    public I18n convert(Document source) {
        if(source == null)
            return null;
        I18nData.I18nDataBuilder builder = I18nData.builder().key( source.getString("key"));
        if(source.containsKey("parameters")) {
            Document parameters = (Document) source.get("parameters");
            if(parameters!=null)
                for(Map.Entry<String,Object> e: parameters.entrySet()){
                    builder.parameter(e.getKey(), (String) e.getValue());
                }
        }

        return builder.build();
    }
}
