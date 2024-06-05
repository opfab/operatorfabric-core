/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.introspect.AnnotatedMember;
import com.fasterxml.jackson.databind.introspect.JacksonAnnotationIntrospector;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.opfab.avro.ResponseCard;
import org.opfab.cards.publication.model.Card;
import org.opfab.springtools.json.InstantModule;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Component
public class CardObjectMapper {

    private final ObjectMapper objectMapper;
    private static final List<String> exclusions = Arrays.asList("getSchema", "getSpecificData");

    public CardObjectMapper() {
        this.objectMapper = JsonMapper.builder().build();

        /* Exclude specific avro fields to avoid Json mapping exceptions */
        objectMapper.setAnnotationIntrospector(new JacksonAnnotationIntrospector() {
            @Override
            public boolean hasIgnoreMarker(final AnnotatedMember m) {
                return exclusions.contains(m.getName()) || super.hasIgnoreMarker(m);
            }
        });
 
        objectMapper.registerModule(new Jdk8Module());
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.registerModule(new InstantModule());
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    public String writeValueAsString(Object value) throws JsonProcessingException {
        return objectMapper.writeValueAsString(value);
    }

    public ResponseCard readResponseCardValue(String writeValueAsString) throws JsonProcessingException {
        return objectMapper.readValue(writeValueAsString, ResponseCard.class);
    }
    public Card readCardPublicationDataValue(String writeValueAsString) throws JsonProcessingException {
        return objectMapper.readValue(writeValueAsString, Card.class);
    }

    public Map<String,Object> readJSONValue(String writeValueAsString) throws JsonProcessingException {
        return objectMapper.readValue(writeValueAsString,new TypeReference<Map<String, Object>>() {
        });
    }
}
