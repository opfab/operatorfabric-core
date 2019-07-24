package org.lfenergy.operatorfabric.cards.consultation.configuration.webflux;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.consultation.repositories.ArchivedCardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.server.*;
import reactor.core.publisher.Mono;

import static org.springframework.web.reactive.function.BodyInserters.fromObject;
import static org.springframework.web.reactive.function.server.ServerResponse.notFound;
import static org.springframework.web.reactive.function.server.ServerResponse.ok;

@Slf4j
@Configuration
public class ArchivedCardRoutesConfig {

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
                        .flatMap(params -> archivedCardRepository.findWithParams(params)
                                .collectList()
                                .flatMap(
                                        archivedCards-> ok().contentType(MediaType.APPLICATION_JSON)
                                                .body(fromObject(archivedCards)))
                        ).switchIfEmpty(notFound().build()); //TODO Does it still work ?
    }

    private HandlerFunction<ServerResponse> archivedCardGetRoute() {
        return request -> archivedCardRepository.findById(request.pathVariable("id"))
                .flatMap(card-> ok().contentType(MediaType.APPLICATION_JSON).body(fromObject(card)))
                .switchIfEmpty(notFound().build());
    }

    private HandlerFunction<ServerResponse> archivedCardOptionRoute() {
        return request -> ok().build();
    }

    //TODO Return Error if unknown query param

    private Mono<MultiValueMap<String, String>> extractParameters(ServerRequest request) {
        return request.bodyToMono(String.class) //TODO What is it for ?
                .switchIfEmpty(Mono.just(""))
                .map(body-> request.queryParams());
    }

}
