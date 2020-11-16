package org.lfenergy.operatorfabric.cards.publication.configuration.kafka;

import io.confluent.kafka.serializers.KafkaAvroSerializerConfig;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.cards.publication.kafka.SchemaRegistryProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

import java.util.Map;

@RequiredArgsConstructor
@ConditionalOnProperty("spring.kafka.consumer.group-id")
@EnableConfigurationProperties(SchemaRegistryProperties.class)
@Configuration
public class ProducerFactoryAutoConfiguration {
    @Value("${spring.kafka.producer.value-serializer}")
    private String valueDeserializer;

    private final KafkaProperties kafkaProperties;

    private Map<String, Object> producerConfigs() {
        Map<String,Object> props = kafkaProperties.buildProducerProperties();
        props.put(ProducerConfig.CLIENT_ID_CONFIG, "opfab-producer");
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, valueDeserializer);
        return props;
    }

    private ProducerFactory<String, CardCommand> producerFactory(SchemaRegistryProperties schemaRegistryProperties) {
        Map<String,Object> props = producerConfigs();
        if (schemaRegistryProperties.getUrl() != null && !schemaRegistryProperties.getUrl().isEmpty()) {
            props.put(KafkaAvroSerializerConfig.SCHEMA_REGISTRY_URL_CONFIG, schemaRegistryProperties.getUrl());
        }
        return new DefaultKafkaProducerFactory<>(props);
    }

    @Bean
    public KafkaTemplate<String, CardCommand> kafkaTemplate(SchemaRegistryProperties schemaRegistryProperties) {
        return new KafkaTemplate<>(producerFactory(schemaRegistryProperties));
    }
}

