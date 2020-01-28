
package org.lfenergy.operatorfabric.springtools.configuration.oauth;

import org.springframework.context.annotation.Import;

import java.lang.annotation.*;

/**
 * Enable OperatorFabric Oauth configuration for Spring Webflux
 *
 * @author David Binder
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Import({OAuth2ReactiveConfiguration.class})
@Documented
public @interface EnableReactiveOperatorFabricOAuth2 {

}
