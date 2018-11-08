package org.lfenergy.operatorfabric.time;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.config.oauth.EnableOperatorFabricOauth2;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.ImportResource;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@SpringBootApplication
@EnableSwagger2
@Slf4j
@RefreshScope
@EnableDiscoveryClient
@EnableOperatorFabricOauth2
@ImportResource("classpath:/cors.xml")
public class TimeApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(TimeApplication.class, args);

        assert (ctx != null);
    }
}