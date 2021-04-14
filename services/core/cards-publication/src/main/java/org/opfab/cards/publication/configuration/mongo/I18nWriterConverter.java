/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.publication.configuration.mongo;

import java.util.Map;

import org.bson.Document;
import org.opfab.cards.publication.model.I18nPublicationData;
import org.springframework.core.convert.converter.Converter;
/**
 *
 * <p>Spring converter to register {@link I18nPublicationData} in mongoDB</p>
 * <p>Converts {@link I18nPublicationData} to {@link Document} </p>
 * <p>Needed after upgrade to spring-boot 2.2.4.RELEASE</p>
 */
public class I18nWriterConverter implements Converter<I18nPublicationData, Document> {

    @Override
    public Document convert(I18nPublicationData source) {
        Document result = new Document();
    
        String key = source.getKey();
        result.append("key", key);

        Map<String,String> parameters = source.getParameters();
        if (parameters!=null) result.append("parameters",parameters);

        return result;
    }
}
