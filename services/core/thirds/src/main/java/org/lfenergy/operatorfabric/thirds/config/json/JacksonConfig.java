/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.thirds.config.json;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
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
   * Builds object mapper adding java 8 custom configuration and business module configuration ({@link ThirdsModule})
   * @param builder Spring internal {@link ObjectMapper} builder [injected]
   * @return
   */
  @Bean
  @Autowired
  public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
    ObjectMapper objectMapper = builder.createXmlMapper(false).build();

    // Some other custom configuration for supporting Java 8 features
    objectMapper.registerModule(new Jdk8Module());
    objectMapper.registerModule(new JavaTimeModule());
    objectMapper.registerModule(new ThirdsModule());
    return objectMapper;
  }
}
