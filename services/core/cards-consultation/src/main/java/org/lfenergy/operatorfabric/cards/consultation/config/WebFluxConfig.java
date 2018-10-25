/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.consultation.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.config.WebFluxConfigurer;
import org.springframework.web.reactive.config.WebFluxConfigurerComposite;

/**
 * <p></p>
 * Created on 22/05/18
 *
 * @author davibind
 */
@Slf4j
@Configuration
public class WebFluxConfig {
  @Bean
  public WebFluxConfigurer corsConfigurer() {
    return new WebFluxConfigurerComposite() {

      @Override
      public void addCorsMappings(org.springframework.web.reactive.config.CorsRegistry registry) {
        registry
           .addMapping("/cards/**")
           .allowedOrigins("*")
           .allowedMethods("*");
      }
    };
  }
}
