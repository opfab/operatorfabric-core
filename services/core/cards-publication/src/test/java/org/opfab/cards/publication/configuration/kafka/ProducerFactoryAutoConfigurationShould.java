/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.cards.publication.configuration.kafka;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.avro.CardCommand;
import org.opfab.cards.publication.kafka.SchemaRegistryProperties;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;
import java.util.Set;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = {"native", "test"})
class ProducerFactoryAutoConfigurationShould {
    @Mock
    private KafkaProperties kafkaProperties;

    @Mock
    private SchemaRegistryProperties schemaRegistryProperties;

    @InjectMocks
    ProducerFactoryAutoConfiguration cut;

    @Test
    void kafkaTemplateWithSchemaUrl() {
        String valueDeserializer = "MyValueDeserializer";
        String schemaUrl = "http://some-url";

        when (schemaRegistryProperties.getUrl()).thenReturn(schemaUrl);
        ReflectionTestUtils.setField(cut, "valueDeserializer", valueDeserializer);
        KafkaTemplate<String, CardCommand>  template = cut.kafkaTemplate(schemaRegistryProperties);

        Set<Map.Entry<String, Object>> properties = template.getProducerFactory().getConfigurationProperties().entrySet();
        assertThat(template.getProducerFactory().getConfigurationProperties().get("value.serializer"), is(valueDeserializer));
        assertThat(template.getProducerFactory().getConfigurationProperties().get("schema.registry.url"), is(schemaUrl));
    }

    @Test
    void kafkaTemplateNoSchemaUrl() {
        String valueDeserializer = "MyValueDeserializer";
        ReflectionTestUtils.setField(cut, "valueDeserializer", valueDeserializer);

        KafkaTemplate<String, CardCommand>  template = cut.kafkaTemplate(schemaRegistryProperties);
        Set<Map.Entry<String, Object>> properties = template.getProducerFactory().getConfigurationProperties().entrySet();
        assertThat(template.getProducerFactory().getConfigurationProperties().get("value.serializer"), is(valueDeserializer));
        assertThat(template.getProducerFactory().getConfigurationProperties().get("schema.registry.url"), is(nullValue()));
    }
}
