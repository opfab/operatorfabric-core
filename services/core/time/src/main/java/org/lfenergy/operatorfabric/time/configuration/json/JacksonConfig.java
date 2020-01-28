
package org.lfenergy.operatorfabric.time.configuration.json;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.json.InstantModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

/**
 * Json configuration
 *
 * @author David Binder
 */
@Configuration
@Slf4j
public class JacksonConfig {

  /**
   * Builds object mapper adding java 8 custom configuration and business module configuration ({@link TimeModule})
   * @param builder Spring internal {@link ObjectMapper} builder [injected]
   * @return configured object mapper for json
   */
  @Bean
  @Autowired
  public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
    ObjectMapper objectMapper = builder.createXmlMapper(false).build();

    // Some other custom configuration to support Java 8 features
    objectMapper.registerModule(new Jdk8Module());
    objectMapper.registerModule(new JavaTimeModule());
    objectMapper.registerModule(new TimeModule());
    objectMapper.registerModule(new InstantModule());
    return objectMapper;
  }
}
