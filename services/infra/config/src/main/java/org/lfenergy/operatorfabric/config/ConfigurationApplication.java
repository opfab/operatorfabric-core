
package org.lfenergy.operatorfabric.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.config.server.EnableConfigServer;

import java.io.IOException;

/**
 * Sets up a configuration with AMQP notification and registration in Eureka
 */
@EnableConfigServer
@EnableDiscoveryClient
@SpringBootApplication
@Slf4j
public class ConfigurationApplication {

    public static void main(String[] args) throws IOException {
        SpringApplication.run(ConfigurationApplication.class, args);
    }

}