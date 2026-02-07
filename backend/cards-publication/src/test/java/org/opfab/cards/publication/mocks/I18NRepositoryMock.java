/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.mocks;

import org.opfab.cards.publication.repositories.I18NRepository;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

public class I18NRepositoryMock implements I18NRepository {

    JsonNode jsonNode;

    public I18NRepositoryMock() {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode node = mapper.createObjectNode();
        node.put("title", "Title translated");
        node.put("summary", "Summary translated {{arg1}}");
        jsonNode = node;
    }

    @Override
    public JsonNode getI18n(String process, String processVersion) {
        return jsonNode;
    }

    public void setJsonNode(JsonNode jsonNode) {
        this.jsonNode = jsonNode;
    }

}
