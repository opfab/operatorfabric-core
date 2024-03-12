/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.publication.mocks;

import org.opfab.cards.publication.repositories.I18NRepository;

import com.fasterxml.jackson.databind.JsonNode;

public class I18NRepositoryMock implements I18NRepository  {

    JsonNode jsonNode;

    @Override
    public JsonNode getI18n(String process, String processVersion) {
        return jsonNode;
    }

    public void setJsonNode(JsonNode jsonNode) {
        this.jsonNode = jsonNode;    
    }
    
}
