
package org.lfenergy.operatorfabric.users.application.configuration;

import org.springframework.security.test.context.support.WithSecurityContext;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * This annotation defines the creation of mock OpFab users for tests
 *
 * @author Alexandra Guironnet
 */
@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockOpFabUserSecurityContextFactory.class)
public @interface WithMockOpFabUser {

    String login() default "myUserLogin";

    String firstName() default  "myUserFirstName";

    String lastName() default  "myUserLastName";

    String[] roles() default "";
}