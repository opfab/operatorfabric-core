
package org.lfenergy.operatorfabric.cards.publication;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.configuration.mongo.EnableOperatorFabricMongo;
import org.lfenergy.operatorfabric.springtools.configuration.time.EnableTimeClient;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.ImportResource;
import org.springframework.data.mongodb.repository.config.EnableReactiveMongoRepositories;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

@SpringBootApplication
@Slf4j
@RefreshScope
@EnableTimeClient
@EnableOperatorFabricMongo
@EnableReactiveMongoRepositories
@ImportResource("classpath:/amqp.xml")
public class CardPublicationApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(CardPublicationApplication.class, args);
        assert (ctx != null);
        ObjectProvider<Jackson2ObjectMapperBuilder> beanProvider = ctx.getBeanProvider(Jackson2ObjectMapperBuilder
           .class);
        log.info(beanProvider.toString());
    }

}
