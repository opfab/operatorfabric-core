
package org.lfenergy.operatorfabric.springtools.configuration.mongo;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Property object to gather OperatorFabric specific mongo properties
 * @author David Binder
 */
@Configuration
@ConfigurationProperties("spring.data.mongodb")
@Data
public class OperatorFabricMongoProperties {
    private List<String> uris;
    private String database;
}
