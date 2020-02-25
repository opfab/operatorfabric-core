/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.publication.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.codec.ServerCodecConfigurer;
import org.springframework.web.reactive.config.WebFluxConfigurer;
import org.springframework.web.reactive.config.WebFluxConfigurerComposite;

import lombok.extern.slf4j.Slf4j;

/**
 * Use to configure the max memory size to unlimited for json flux (default is 256K) 
 
 */
@Slf4j
@Configuration
public class WebFluxConfig {
  /**
   * Configures the max memory size to unlimited for json flux (default is 256K) 
   *
   * @return element of {@link WebFluxConfigurerComposite}
   */
  @Bean
  public WebFluxConfigurer opfabServerCodecConfigurer() {
    return new WebFluxConfigurerComposite() {

      @Override
      public void configureHttpMessageCodecs(ServerCodecConfigurer configurer) {
        configurer.defaultCodecs().maxInMemorySize(-1);
       }
    };
  }
}