
package org.lfenergy.operatorfabric.thirds.application;

import org.lfenergy.operatorfabric.thirds.configuration.json.JacksonConfig;
import org.lfenergy.operatorfabric.thirds.controllers.CustomExceptionHandler;
import org.lfenergy.operatorfabric.thirds.controllers.ThirdsController;
import org.lfenergy.operatorfabric.thirds.services.ThirdsService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@Import({ThirdsService.class, CustomExceptionHandler.class, JacksonConfig.class, ThirdsController.class})
public class IntegrationTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(IntegrationTestApplication.class, args);
        assert (ctx != null);
    }

}
