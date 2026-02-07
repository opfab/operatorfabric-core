/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * Copyright (c) 2021-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.kafka;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.cfg.MapperConfig;
import tools.jackson.databind.introspect.AnnotatedMember;
import tools.jackson.databind.introspect.JacksonAnnotationIntrospector;
import tools.jackson.databind.json.JsonMapper;
import org.opfab.avro.ResponseCard;
import org.opfab.cards.publication.model.Card;
import org.opfab.json.InstantModule;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Component
public class CardObjectMapper {

    private final ObjectMapper objectMapper;
    private static final List<String> exclusions = Arrays.asList("getSchema", "getSpecificData");

    public CardObjectMapper() {
        this.objectMapper = JsonMapper.builder()
                .addModule(new InstantModule())
                .annotationIntrospector(new JacksonAnnotationIntrospector() {
                    /* Exclude specific avro fields to avoid Json mapping exceptions */
                    @Override
                    public boolean hasIgnoreMarker(MapperConfig<?> config, final AnnotatedMember m) {
                        return exclusions.contains(m.getName()) || super.hasIgnoreMarker(config, m);
                    }
                })
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
                .build();

    }

    public String writeValueAsString(Object value) {
        return objectMapper.writeValueAsString(value);
    }

    public ResponseCard readResponseCardValue(String writeValueAsString) {
        return objectMapper.readValue(writeValueAsString, ResponseCard.class);
    }

    public Card readCardPublicationDataValue(String writeValueAsString) {
        return objectMapper.readValue(writeValueAsString, Card.class);
    }

    public Map<String, Object> readJSONValue(String writeValueAsString) {
        return objectMapper.readValue(writeValueAsString, new TypeReference<Map<String, Object>>() {
        });
    }
}
