
package org.lfenergy.operatorfabric.thirds;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.configuration.oauth.EnableOperatorFabricOAuth2;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.ImportResource;

@SpringBootApplication
//@EnableSwagger2
@Slf4j
@RefreshScope
@EnableOperatorFabricOAuth2
public class ThirdsApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(ThirdsApplication.class, args);
        assert (ctx != null);
    }

}
