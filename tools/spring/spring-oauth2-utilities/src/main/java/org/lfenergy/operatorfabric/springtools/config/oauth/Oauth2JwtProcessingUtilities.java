package org.lfenergy.operatorfabric.springtools.config.oauth;

import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

/**
 * Some share utilities
 *
 * @author David Binder
 */
public class Oauth2JwtProcessingUtilities {

    /**
     * Store Jwt token in local thread to allow passing token through non communicating APIs (spring / feign)
     */
    public static ThreadLocal<Jwt> token = new ThreadLocal<>();

    /**
     * Creates Authority list from user's groups (ROLE_[group name])
     * @param user user model data
     * @return list of authority
     */
    public static List<GrantedAuthority> computeAuthorities(User user) {
        return AuthorityUtils.createAuthorityList(user.getGroups().stream().map(g -> "ROLE_" + g).toArray(size ->
           new
              String[size]));
    }
}
