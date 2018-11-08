package org.lfenergy.operatorfabric.springtools.config.oauth;

import lombok.Getter;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Collection;

/**
 * <p></p>
 * Created on 24/09/18
 *
 * @author davibind
 */
public class OpFabJwtAuthenticationToken extends JwtAuthenticationToken {
    @Getter
    private final Object principal;

    public OpFabJwtAuthenticationToken(Jwt jwt, User principal, Collection<? extends GrantedAuthority>
       authorities) {
        super(jwt, authorities);
        this.principal = principal;
    }
}
