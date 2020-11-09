package org.lfenergy.operatorfabric.cards.publication.kafka.consumer;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix="schema.registry")
public class SchemaRegistryProperties {

    private String url;

}
