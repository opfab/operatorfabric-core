package org.lfenergy.operatorfabric.springtools.config.mongo;

import org.springframework.context.annotation.Import;

import java.lang.annotation.*;

/**
 * <p></p>
 * Created on 29/06/18
 *
 * @author davibind
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Import({MongoConfiguration.class, OperatorFabricMongoProperties.class})
@Documented
public @interface EnableOperatorFabricMongo {

}
