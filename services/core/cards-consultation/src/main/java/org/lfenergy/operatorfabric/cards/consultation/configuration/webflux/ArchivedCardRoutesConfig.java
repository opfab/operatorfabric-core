package org.lfenergy.operatorfabric.cards.consultation.configuration.webflux;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.consultation.repositories.ArchivedCardRepository;
import org.lfenergy.operatorfabric.springtools.configuration.oauth.OpFabJwtAuthenticationToken;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.server.*;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

import static org.springframework.web.reactive.function.BodyInserters.fromObject;
import static org.springframework.web.reactive.function.server.ServerResponse.notFound;
import static org.springframework.web.reactive.function.server.ServerResponse.ok;
import static reactor.util.function.Tuples.of;

@Slf4j
@Configuration
public class ArchivedCardRoutesConfig implements UserExtractor {

    private final ArchivedCardRepository archivedCardRepository;

    @Autowired
    public ArchivedCardRoutesConfig(ArchivedCardRepository archivedCardRepository) { this.archivedCardRepository = archivedCardRepository; }

    /**
     * Archived cards route configuration
     * @return route
     */
    @Bean
    public RouterFunction<ServerResponse> archivedCardRoutes() {
        return RouterFunctions
                .route(RequestPredicates.GET("/archives/{id}"),archivedCardGetRoute())
                .andRoute(RequestPredicates.GET("/archives/**"),archivedCardGetWithQueryRoute())
                .andRoute(RequestPredicates.OPTIONS("/archives/**"),archivedCardOptionRoute());
    }

    private HandlerFunction<ServerResponse> archivedCardGetWithQueryRoute() {
        return request ->
                extractParameters(request)
                        .flatMap(params -> archivedCardRepository.findWithUserAndParams(params)
                                .flatMap(archivedCards-> ok().contentType(MediaType.APPLICATION_JSON)
                                                .body(fromObject(archivedCards))));
    }

    private HandlerFunction<ServerResponse> archivedCardGetRoute() {
        return request ->
                extractUserFromJwtToken(request)
                        .flatMap(user -> archivedCardRepository.findByIdWithUser(request.pathVariable("id"),user))
                        .flatMap(card-> ok().contentType(MediaType.APPLICATION_JSON).body(fromObject(card)))
                        .switchIfEmpty(notFound().build());
    }

    private HandlerFunction<ServerResponse> archivedCardOptionRoute() {
        return request -> ok().build();
    }

    /**
     * Extracts request parameters from Authentication and Query parameters
     * @param request the http request
     * @return a Tuple containing the principal as a {@link User} and query parameters as a {@link MultiValueMap}
     */
    private Mono<Tuple2<User,MultiValueMap<String, String>>> extractParameters(ServerRequest request) {
        return request.principal()
                .map( principal ->  {
                    OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
                    User user = (User) jwtPrincipal.getPrincipal();
                    return of(user,request.queryParams());
                });
    }

}
