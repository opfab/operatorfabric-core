
package org.lfenergy.operatorfabric.springtools.configuration.oauth;

import org.springframework.context.annotation.Import;

import java.lang.annotation.*;

/**
 * Enable OperatorFabric Oauth configuration for Spring MVC
 *
 * @author David Binder
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Import(OAuth2GenericConfiguration.class)
@Documented
public @interface EnableOperatorFabricOAuth2 {

}
