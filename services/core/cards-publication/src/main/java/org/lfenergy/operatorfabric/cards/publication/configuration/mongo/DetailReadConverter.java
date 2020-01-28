/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.publication.configuration.mongo;

import org.bson.Document;
import org.lfenergy.operatorfabric.cards.model.TitlePositionEnum;
import org.lfenergy.operatorfabric.cards.publication.model.Detail;
import org.lfenergy.operatorfabric.cards.publication.model.DetailPublicationData;
import org.springframework.core.convert.converter.Converter;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

/**
 *
 * <p>Spring converter registered in mongo conversions</p>
 * <p>Converts {@link Document} to {@link Detail} using {@link DetailPublicationData} builder</p>
 *
 */

@Slf4j
public class DetailReadConverter implements Converter<Document, Detail> {

    private I18nReadConverter i18nReadConverter = new I18nReadConverter();

    @Override
    public Detail convert(Document source) {
        DetailPublicationData.DetailPublicationDataBuilder detailBuilder = DetailPublicationData.builder()
                .titleStyle(source.getString("titleStyle"))
                .templateName(source.getString("templateName"))
                .title(i18nReadConverter.convert((Document) source.get("title")));

        String titlePositionString = source.getString("titlePosition");
        if(titlePositionString!=null)
            detailBuilder.titlePosition(TitlePositionEnum.valueOf(titlePositionString));
        try {
            List<String> styles = (List<String>) source.get("styles");
            if(styles != null)
                detailBuilder.styles(styles);
        }
        catch (ClassCastException exception) {
                log.error("Unexpected Error arose ", exception);
        }
        return detailBuilder.build();
    }
}
