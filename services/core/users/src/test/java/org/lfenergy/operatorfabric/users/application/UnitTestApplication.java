package org.lfenergy.operatorfabric.users.application;

import org.lfenergy.operatorfabric.springtools.config.mongo.EnableOperatorFabricMongo;
import org.lfenergy.operatorfabric.users.config.DataInitComponent;
import org.lfenergy.operatorfabric.users.config.json.JacksonConfig;
import org.lfenergy.operatorfabric.users.config.mongo.LocalMongoConfig;
import org.lfenergy.operatorfabric.users.config.users.UsersProperties;
import org.lfenergy.operatorfabric.users.controllers.CustomExceptionHandler;
import org.lfenergy.operatorfabric.users.controllers.GroupsController;
import org.lfenergy.operatorfabric.users.controllers.UsersController;
import org.lfenergy.operatorfabric.users.repositories.UserRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableOperatorFabricMongo
@EnableConfigurationProperties
@EnableMongoRepositories(basePackageClasses = UserRepository.class)
@Import({JacksonConfig.class,LocalMongoConfig.class,UsersProperties.class,CustomExceptionHandler.class,GroupsController
   .class,UsersController.class,DataInitComponent.class})
public class UnitTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(UnitTestApplication.class, args);
        assert (ctx != null);
//        DataInitService service = ctx.getBean(DataInitService.class);
//        assert service.isInitiated();
    }

}
