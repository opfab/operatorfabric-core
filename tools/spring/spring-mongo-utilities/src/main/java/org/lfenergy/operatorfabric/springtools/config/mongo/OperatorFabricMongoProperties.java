package org.lfenergy.operatorfabric.springtools.config.mongo;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * <p></p>
 * Created on 26/07/18
 *
 * @author davibind
 */
@Configuration
@ConfigurationProperties("spring.data.mongodb")
@Data
public class OperatorFabricMongoProperties {
    private List<String> uris;
    private String database;
}
