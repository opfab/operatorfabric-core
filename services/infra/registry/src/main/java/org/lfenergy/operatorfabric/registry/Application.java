package org.lfenergy.operatorfabric.registry;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@EnableEurekaServer
@SpringBootApplication
@Slf4j
public class Application {
//    @Value("#{eureka.client.serviceUrl.defaultZone}")
//    private String defaultZone;

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

//    @PostConstruct
//    public void display(){
//        log.info("DEFAULT_ZONE: "+defaultZone);
//    }
}
