package org.lfenergy.operatorfabric.cards.consultation.configuration.webflux;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.consultation.repositories.ArchivedCardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.*;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuple6;
import reactor.util.function.Tuples;

import java.util.List;

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
                .route(RequestPredicates.GET("/archives/**"),archivedCardGetRoute())
                .andRoute(RequestPredicates.OPTIONS("/archives/**"),archivedCardOptionRoute());
    }

    private HandlerFunction<ServerResponse> archivedCardGetRoute() {
        return request ->
                extractParameters(request)
                        .flatMap(t -> archivedCardRepository.findByPublisherAndProcess(t.getT1(),t.getT2())
                                .collectList()
                                .flatMap(archivedCards-> ok().contentType(MediaType.APPLICATION_JSON).body(fromObject(archivedCards)))
                        ).switchIfEmpty(notFound().build()); //TODO Does it still work ?
    }

    private HandlerFunction<ServerResponse> archivedCardOptionRoute() {
        return request -> ok().build();
    }

    private Mono<Tuple2<String, String>> extractParameters(ServerRequest request) {
        return request.bodyToMono(String.class)
                .switchIfEmpty(Mono.just(""))
                .map(body-> Tuples.of(
                        request.queryParam("publisher").orElse("null"),
                        request.queryParam("process").orElse("null")
                ));
    }

}
