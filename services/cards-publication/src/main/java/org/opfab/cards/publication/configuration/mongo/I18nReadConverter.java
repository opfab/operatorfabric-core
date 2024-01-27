/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.cards.publication.configuration.mongo;

import org.bson.Document;
import org.opfab.cards.publication.model.I18n;
import org.springframework.core.convert.converter.Converter;

import java.util.HashMap;
import java.util.Map;

public class I18nReadConverter implements Converter<Document, I18n> {

    @Override
    public I18n convert(Document source) {
        String key = source.getString("key");
        Map<String, String> parametersMap = convertParametersToMap(source);

        return new I18n(key, parametersMap);
    }

    private Map<String, String> convertParametersToMap(Document source) {
        Document parameters = (Document) source.get("parameters");
        if (parameters == null) {
            return new HashMap<>();
        }

        Map<String, String> parametersMap = new HashMap<>();
        for (Map.Entry<String, Object> e : parameters.entrySet()) {
            parametersMap.put(e.getKey(), (String) e.getValue());
        }
        return parametersMap;
    }
}
