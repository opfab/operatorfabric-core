package org.lfenergy.operatorfabric.cards.consultation.configuration.webflux;

import org.lfenergy.operatorfabric.springtools.configuration.oauth.OpFabJwtAuthenticationToken;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.web.reactive.function.server.ServerRequest;
import reactor.core.publisher.Mono;

public interface UserExtractor {

    default Mono<User> extractUserFromJwtToken(ServerRequest request){
        return request.principal()
                .map( principal ->  {
                    OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
                    return (User) jwtPrincipal.getPrincipal();
                });
    }
}
