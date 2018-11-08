package org.lfenergy.operatorfabric.springtools.config.oauth;

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
@Import({Oauth2GenericConfiguration.class,Oauth2ReactiveConfiguration.class})
@Documented
public @interface EnableReactiveOperatorFabricOauth2 {

}
