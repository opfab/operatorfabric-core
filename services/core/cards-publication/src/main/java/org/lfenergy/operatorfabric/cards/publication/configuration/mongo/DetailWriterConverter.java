/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.publication.configuration.mongo;

import org.bson.Document;
import org.lfenergy.operatorfabric.cards.publication.model.I18n;
import org.lfenergy.operatorfabric.cards.publication.model.I18nPublicationData;
import org.lfenergy.operatorfabric.cards.model.TitlePositionEnum;
import org.lfenergy.operatorfabric.cards.publication.model.DetailPublicationData;
import org.springframework.core.convert.converter.Converter;

import java.util.List;

/**
 *
 * <p>Spring converter to register {@link DetailPublicationData} in mongoDB</p>
 * <p>Converts {@link DetailPublicationData} to {@link Document} </p>
 * <p>Needed after upgrade to spring-boot 2.2.4.RELEASE</p>
 */
public class DetailWriterConverter implements Converter<DetailPublicationData, Document> {

    private I18nWriterConverter i18nWriterConverter = new I18nWriterConverter();

    @Override
    public Document convert(DetailPublicationData source) {
        Document result = new Document();
        
        TitlePositionEnum titlePositionEnum = source.getTitlePosition();
        if (titlePositionEnum!=null) result.append("titlePosition", titlePositionEnum.toString());

        String titleStyle  = source.getTitleStyle();
        if (titleStyle!=null) result.append("titleStyle", titleStyle);

        String templateName  = source.getTemplateName();
        if (templateName!=null) result.append("templateName", templateName);

        I18n i18n = source.getTitle();
        if (i18n!=null) result.append("title",i18nWriterConverter.convert((I18nPublicationData) i18n));

        List<String> styles = source.getStyles();
        if (styles!=null) result.append("styles",styles);

        return result;
    }
}