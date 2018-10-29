package org.lfenergy.operatorfabric.cards.consultation.application;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.consultation.Application;
import org.lfenergy.operatorfabric.cards.consultation.config.json.JacksonConfig;
import org.lfenergy.operatorfabric.cards.consultation.config.mongo.LocalMongoConfiguration;
import org.lfenergy.operatorfabric.springtools.config.mongo.EnableOperatorFabricMongo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.ImportResource;
import org.springframework.data.mongodb.repository.config.EnableReactiveMongoRepositories;

/**
 * <p></p>
 * Created on 29/10/18
 *
 * @author davibind
 */
@SpringBootApplication
@Slf4j
@RefreshScope
@EnableOperatorFabricMongo
@EnableReactiveMongoRepositories
@ImportResource("classpath:/amqp.xml")
@Import({JacksonConfig.class, LocalMongoConfiguration.class})
public class IntegrationTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(Application.class, args);

        assert (ctx != null);
    }
}
