package org.opfab.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

/**
 * This class is configuring an internal service account with basic
 * authentication.
 *
 * The internal service account is used for internal communication between
 * services.
 */
@Configuration
public class InternalAccountSecurityConfiguration {

    @Value("${operatorfabric.internalServiceAccountPassword}")
    private String internalServiceAccountPassword;

    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails internalAccount = User
                .withUsername("internalServiceAccount")
                .password(passwordEncoder().encode(internalServiceAccountPassword))
                .roles("INTERNAL_SERVICE")
                .build();

        return new InMemoryUserDetailsManager(internalAccount);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
