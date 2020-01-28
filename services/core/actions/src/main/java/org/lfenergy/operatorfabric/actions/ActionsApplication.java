
package org.lfenergy.operatorfabric.actions;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.actions.services.feign.CardConsultationServiceProxy;
import org.lfenergy.operatorfabric.springtools.configuration.oauth.EnableReactiveOperatorFabricOAuth2;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.ConfigurableApplicationContext;


@SpringBootApplication
@Slf4j
@RefreshScope
@EnableDiscoveryClient
@EnableReactiveOperatorFabricOAuth2
//@EnableOperatorFabricMongo
//@EnableReactiveMongoRepositories
@EnableFeignClients(basePackageClasses = CardConsultationServiceProxy.class)
//@ImportResource("classpath:/amqp.xml")
public class ActionsApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(ActionsApplication.class, args);

        assert (ctx != null);
    }
}