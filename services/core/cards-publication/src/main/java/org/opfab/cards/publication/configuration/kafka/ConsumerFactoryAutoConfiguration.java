/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.configuration.kafka;

import io.confluent.kafka.serializers.KafkaAvroDeserializerConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.cards.publication.kafka.SchemaRegistryProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;

import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty("spring.kafka.consumer.group-id")
@EnableConfigurationProperties(SchemaRegistryProperties.class)
@Import({KafkaListenerContainerFactoryConfiguration.class})
@Configuration
public class ConsumerFactoryAutoConfiguration {

    private final KafkaProperties kafkaProperties;

    private String deserializerKeyClass = "org.apache.kafka.common.serialization.StringDeserializer";

    @Value("${spring.deserializer.value.delegate.class}")
    private String valueDeserializer;

    private Map<String,Object> consumerConfig() {
        log.info("bootstrapServers: " + kafkaProperties.getBootstrapServers());
        Map<String,Object> props = kafkaProperties.buildConsumerProperties();
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        props.put(ErrorHandlingDeserializer.KEY_DESERIALIZER_CLASS, deserializerKeyClass);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        props.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, valueDeserializer);
        props.put("specific.avro.reader", "true");
        return props;
    }

    @Bean
    ConsumerFactory<String, CardCommand> consumerFactory(SchemaRegistryProperties schemaRegistryProperties) {
        Map<String,Object> props = consumerConfig();
        if (schemaRegistryProperties.getUrl() != null && !schemaRegistryProperties.getUrl().isEmpty()) {
            props.put(KafkaAvroDeserializerConfig.SCHEMA_REGISTRY_URL_CONFIG, schemaRegistryProperties.getUrl());
        }
        return new DefaultKafkaConsumerFactory<>(props);
    }

}
