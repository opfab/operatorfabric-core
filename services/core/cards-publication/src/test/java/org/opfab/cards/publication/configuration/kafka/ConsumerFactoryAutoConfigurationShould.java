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

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.avro.CardCommand;
import org.opfab.cards.publication.kafka.SchemaRegistryProperties;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = "test")
class ConsumerFactoryAutoConfigurationShould {

    @Mock
    private KafkaProperties kafkaProperties;

    @Mock
    private SchemaRegistryProperties schemaRegistryProperties;

    @InjectMocks
    private ConsumerFactoryAutoConfiguration cut;

    private final Map<String,Object> props = new HashMap<>();

    @BeforeEach
    private void SetUp() {
        ReflectionTestUtils.setField(cut, "valueDeserializer", "MyValueDeserializer");
        when(kafkaProperties.getBootstrapServers()).thenReturn(new ArrayList<>());
        when(kafkaProperties.buildConsumerProperties()).thenReturn(props);
    }

    @Test
    void testConsumerFactoryWithoutSchemaRegistry() {
        when(schemaRegistryProperties.getUrl()).thenReturn(null);

        ConsumerFactory<String, CardCommand > result = cut.consumerFactory(schemaRegistryProperties);
        assertNotNull(result);
        verify(schemaRegistryProperties, times(1)).getUrl();
    }

    @Test
    void testConsumerFactoryWithSchemaRegistry() {
        when(schemaRegistryProperties.getUrl()).thenReturn("Url of Registry");

        ConsumerFactory<String, CardCommand > result = cut.consumerFactory(schemaRegistryProperties);
        assertNotNull(result);
        verify(schemaRegistryProperties, times(3)).getUrl();
    }
}
