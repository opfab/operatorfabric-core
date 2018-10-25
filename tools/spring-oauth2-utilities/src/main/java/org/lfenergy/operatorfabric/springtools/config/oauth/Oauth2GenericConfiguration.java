/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.springtools.config.oauth;

import feign.RequestInterceptor;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

//import org.springframework.boot.autoconfigure.security.oauth2.resource.AuthoritiesExtractor;
//import org.springframework.boot.autoconfigure.security.oauth2.resource.JwtAccessTokenConverterConfigurer;
//import org.springframework.boot.autoconfigure.security.oauth2.resource.PrincipalExtractor;
//import org.springframework.security.oauth2.client.OAuth2ClientContext;
//import org.springframework.security.oauth2.client.resource.OAuth2ProtectedResourceDetails;
//import org.springframework.security.oauth2.client.token.grant.password.ResourceOwnerPasswordResourceDetails;
//import org.springframework.security.oauth2.common.OAuth2AccessToken;
//import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
//import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
//import org.springframework.security.oauth2.provider.OAuth2Authentication;
//import org.springframework.security.oauth2.provider.token.AccessTokenConverter;
//import org.springframework.security.oauth2.provider.token.DefaultAccessTokenConverter;
//import org.springframework.security.oauth2.provider.token.DefaultUserAuthenticationConverter;
//import org.springframework.security.oauth2.provider.token.UserAuthenticationConverter;
//import org.springframework.security.oauth2.provider.token.store.JwtAccessTokenConverter;

/**
 * <p></p>
 * Created on 09/08/18
 *
 * @author davibind
 */
@EnableFeignClients
@EnableDiscoveryClient
@Configuration
@Slf4j
public class Oauth2GenericConfiguration  {

    public static ThreadLocal<Jwt> token = new ThreadLocal<>();

    @Autowired
    private UserServiceProxy proxy;
    @Autowired
    private ApplicationContext context;

    @Bean
    public Converter<Jwt, AbstractAuthenticationToken> opfabJwtConverter(){
        return new Converter<Jwt, AbstractAuthenticationToken>(){

            @Override
            public AbstractAuthenticationToken convert(Jwt jwt) {
                String principalId = jwt.getClaimAsString("sub");
                token.set(jwt);
                User user = proxy.fetchUser(principalId);
                token.remove();
                List<GrantedAuthority> authorities = computeAuthorities(user);
                return new OpFabJwtAuthenticationToken(jwt,user,authorities);
            }
        };
    }

//    @Bean
//    public PrincipalExtractor principalExtractor() {
//        return map -> {
//            String principalId = (String) map.get("principal");
//            UserData UserData = proxy.fetchUser(principalId);
//            map.put("businessUser",UserData);
//            return UserData;
//
//        };
//    }
//
//    @Bean
//    public AuthoritiesExtractor authoritiesExtractor() {
//        return map -> {
//            UserData UserData = (UserData) map.get("businessUser");
//            return computeAuthorities(UserData);
//        };
//    }

    private static List<GrantedAuthority> computeAuthorities(User UserData) {
        return AuthorityUtils.createAuthorityList(UserData.getGroups().stream().map(g->"ROLE_"+g).toArray(size-> new
           String[size]));
    }

    @Bean
    public RequestInterceptor oauth2FeignRequestInterceptor() {
        return new OAuth2FeignRequestInterceptor();
    }

//    @Override
//    public void configure(JwtAccessTokenConverter converter) {
//        DefaultAccessTokenConverter tokenConverter = new DefaultAccessTokenConverter(){
//            @Override
//            public OAuth2AccessToken extractAccessToken(String value, Map<String, ?> map) {
//                OAuth2AccessToken oAuth2AccessToken = super.extractAccessToken(value, map);
//                context.getBean(OAuth2ClientContext.class).setAccessToken(oAuth2AccessToken);
//                return oAuth2AccessToken;
//            }
//        };
//        tokenConverter.setUserTokenConverter(new DefaultUserAuthenticationConverter(){
//            @Override
//            public Authentication extractAuthentication(Map<String, ?> map) {
//                if (map.containsKey(USERNAME)) {
//                    UserData UserData = proxy.fetchUser((String) map.get(USERNAME));;
//                    Collection<? extends GrantedAuthority> authorities = computeAuthorities(UserData);
//                    return new UsernamePasswordAuthenticationToken(UserData, "N/A", authorities);
//                }
//                return null;
//            }
//        });
//        converter.setAccessTokenConverter(tokenConverter);
//    }
}
