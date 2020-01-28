
package org.lfenergy.operatorfabric.springtools.configuration.mongo;

import org.springframework.context.annotation.Import;

import java.lang.annotation.*;

/**
 * <p>Enables Mongo generic configuration for OperatorFabric (see {@link MongoConfiguration})</p>
 *
 * @author David Binder
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Import({MongoConfiguration.class, OperatorFabricMongoProperties.class})
@Documented
public @interface EnableOperatorFabricMongo {

}
