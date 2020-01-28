
package org.lfenergy.operatorfabric.actions.application;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.actions.application.configuration.FeignMockConfiguration;
import org.lfenergy.operatorfabric.actions.configuration.Common;
import org.lfenergy.operatorfabric.actions.configuration.json.JacksonConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;

/**
 * <p></p>
 * Created on 29/10/18
 *
 * @author David Binder
 */
@SpringBootApplication
@Slf4j
@RefreshScope
@Import({JacksonConfig.class, Common.class, FeignMockConfiguration.class})
public class IntegrationTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(IntegrationTestApplication.class, args);

        assert (ctx != null);
    }
}
