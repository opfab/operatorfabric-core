/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.utilities;

import java.io.IOException;
import java.util.Map;
import com.fasterxml.jackson.databind.JsonNode;
import com.github.jknack.handlebars.Handlebars;
import com.github.jknack.handlebars.Template;


public class I18nTranslation {
    
    private JsonNode i18n;

    public I18nTranslation(JsonNode i18n) {
        this.i18n = i18n;
    }

    public String translate(String key, Map<String, String> parameters) throws IOException {
        String[] keyPath = key.split("\\.");
        JsonNode node = this.i18n;
        int i = 0;
        while (node != null && i < keyPath.length) {
            node = node.get(keyPath[i]);
            i++;
        }

        if (node == null) {
            return key;
        }
        
        String nodeText = node.asText();

        if (parameters == null || parameters.isEmpty()) {
            return nodeText;
        }

        Handlebars handlebars = new Handlebars();
        Template template = handlebars.compileInline(nodeText);
    
        return template.apply(parameters);
    }

}
