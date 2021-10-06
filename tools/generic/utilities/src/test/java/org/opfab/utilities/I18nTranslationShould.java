/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.utilities;

import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.HashMap;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;

public class I18nTranslationShould {

    @Test
    public void translate() throws Exception {
        String json = "  {\"process\": {\"card\": {  \"summary\": \"{{contingenciesSize}} contingencies\",\"title\": \"Card title\"}}}";

        ObjectMapper mapper = new ObjectMapper();
        JsonNode obj = mapper.readTree(json);

        I18nTranslation trans = new I18nTranslation(obj);

        String titleTranslated = trans.translate("process.card.title", null);
        assertThat(titleTranslated).isEqualTo("Card title");

        Map<String, String> params = new HashMap();
        params.put("contingenciesSize", "56");
        String summaryTranslated = trans.translate("process.card.summary", params);
        assertThat(summaryTranslated).isEqualTo("56 contingencies");

        String json2 = "  {\"process\": {\"card\": {  \"summary\": \"{{contingenciesSize}} contingencies on {{country}} network\",\"title\": \"Card title\"}}}";

        JsonNode obj2 = mapper.readTree(json2);

        I18nTranslation trans2 = new I18nTranslation(obj2);

        Map<String, String> params2 = new HashMap();
        params2.put("contingenciesSize", "12");
        params2.put("country", "France");
        String summaryTranslated2 = trans2.translate("process.card.summary", params2);
        assertThat(summaryTranslated2).isEqualTo("12 contingencies on France network");
    }

}