package org.lfenergy.operatorfabric.cards.consultation;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.config.mongo.EnableOperatorFabricMongo;
import org.lfenergy.operatorfabric.springtools.config.oauth.EnableReactiveOperatorFabricOauth2;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.ImportResource;
import org.springframework.data.mongodb.repository.config.EnableReactiveMongoRepositories;


@SpringBootApplication
@Slf4j
@RefreshScope
@EnableDiscoveryClient
@EnableReactiveOperatorFabricOauth2
@EnableOperatorFabricMongo
@EnableReactiveMongoRepositories
@ImportResource("classpath:/amqp.xml")
public class CardConsultationApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(CardConsultationApplication.class, args);

        assert (ctx != null);
    }
}