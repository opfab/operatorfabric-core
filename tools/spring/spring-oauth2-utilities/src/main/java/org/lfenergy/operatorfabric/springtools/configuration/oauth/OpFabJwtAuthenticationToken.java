
package org.lfenergy.operatorfabric.springtools.configuration.oauth;

import lombok.Getter;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Collection;

/**
 * Custom OperatorFabric Jwt Authentication Token whose custom principal is a {@link User} object
 *
 * @author David Binder
 */
public class OpFabJwtAuthenticationToken extends JwtAuthenticationToken {
    @Getter
    private final Object principal;

    /**
     * @param jwt
     *    original Jwt object from http call
     * @param principal
     *    custom principal
     * @param authorities
     *    list of authorities
     */
    public OpFabJwtAuthenticationToken(Jwt jwt, User principal, Collection<? extends GrantedAuthority>
       authorities) {
        super(jwt, authorities);
        this.principal = principal;
    }
}
