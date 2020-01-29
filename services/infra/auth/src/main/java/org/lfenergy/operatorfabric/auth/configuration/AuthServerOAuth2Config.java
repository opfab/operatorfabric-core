/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.auth.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.config.annotation.configurers.ClientDetailsServiceConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configuration.AuthorizationServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerEndpointsConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.token.DefaultAccessTokenConverter;
import org.springframework.security.oauth2.provider.token.DefaultTokenServices;
import org.springframework.security.oauth2.provider.token.TokenStore;
import org.springframework.security.oauth2.provider.token.store.JwtAccessTokenConverter;
import org.springframework.security.oauth2.provider.token.store.JwtTokenStore;

import java.security.KeyPair;

/**
 * Configure OAuth authentication
 */
@Configuration
public class AuthServerOAuth2Config extends AuthorizationServerConfigurerAdapter {

    @Autowired
    @Qualifier("authenticationManagerBean")
    private AuthenticationManager authenticationManager;
    @Autowired
    KeyPair keyPair;

    /**
     *
     * @return BCrypt password encoder
     */
    @Bean
    @Primary
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    public void configure(
       AuthorizationServerSecurityConfigurer oauthServer) {
        oauthServer
           .tokenKeyAccess("permitAll()")
           .checkTokenAccess("isAuthenticated()");
    }

    @Override
    public void configure(ClientDetailsServiceConfigurer clients)
       throws Exception {
        PasswordEncoder encoder = passwordEncoder();
        clients.inMemory()
           .withClient("sampleClientId")
           .authorizedGrantTypes("implicit")
           .scopes("read")
           .autoApprove(true)
           .and()
           .withClient("clientIdPassword")
           .secret(encoder.encode("secret"))
           .authorizedGrantTypes(
              "password", "authorization_code", "refresh_token")
           .scopes("read", "user_info")
           .autoApprove(true)
           .accessTokenValiditySeconds(1800)
           .refreshTokenValiditySeconds(43200)
           .redirectUris("http://localhost:2002/ui/login");
    }

    @Override
    public void configure(
       AuthorizationServerEndpointsConfigurer endpoints)
       throws Exception {

        endpoints
           .tokenStore(tokenStore())
           .accessTokenConverter(accessTokenConverter())
           .authenticationManager(authenticationManager);
    }

//    @Bean
//    public TokenStore tokenStore() {
//        return new InMemoryTokenStore();
//    }

    /**
     *
     * @return Jwt Token Store
     */
    @Bean
    public TokenStore tokenStore() {
        return new JwtTokenStore(accessTokenConverter());
    }

    /**
     * build jwt access token converter from configured key pair
     * @return Jwt access token converter
     */
    @Bean
    public JwtAccessTokenConverter accessTokenConverter() {
        JwtAccessTokenConverter converter = new JwtAccessTokenConverter();
        converter.setKeyPair(this.keyPair);

        DefaultAccessTokenConverter accessTokenConverter = new DefaultAccessTokenConverter();
        accessTokenConverter.setUserTokenConverter(new SubjectAttributeUserTokenConverter());
        converter.setAccessTokenConverter(accessTokenConverter);

        return converter;
    }

    /**
     * Builds token service setting store, refresh token and validity duration
     * @return token service
     */
    @Bean
    @Primary
    public DefaultTokenServices tokenServices() {
        DefaultTokenServices defaultTokenServices = new DefaultTokenServices();
        defaultTokenServices.setTokenStore(tokenStore());
        defaultTokenServices.setSupportRefreshToken(true);
        defaultTokenServices.setReuseRefreshToken(false);
        defaultTokenServices.setAccessTokenValiditySeconds(1800);
        defaultTokenServices.setRefreshTokenValiditySeconds(43200);

        return defaultTokenServices;
    }
}
