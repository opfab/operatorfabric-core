package org.lfenergy.operatorfabric.gateway;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * <p></p>
 * Created on 05/10/18
 *
 * @author davibind
 */
@SpringBootApplication
@EnableDiscoveryClient
@Slf4j
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

//    @Value("${spring.cloud.bootstrap.location}")
//    String bootstraploc;
//    @PostConstruct
//    public void init(){
//        log.info("BOOTSTRAP LOCATION: "+bootstraploc);
//    }
}
