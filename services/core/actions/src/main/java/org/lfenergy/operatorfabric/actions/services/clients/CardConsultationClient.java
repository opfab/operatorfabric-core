package org.lfenergy.operatorfabric.actions.services.clients;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.model.Card;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class CardConsultationClient {

    public static final String CARD_401_MESSAGE = "OperatorFabric Card service returned 401(Unauthorized), " +
            "authentication may have expired or remote service is incorrectly configured";
    public static final String CARD_403_MESSAGE = "OperatorFabric Card service returned 403(Unauthorized), " +
            "user not allowed to access resource";
    public static final String CARD_ERROR_MESSAGE = "Error accessing OperatorFabric Card service, no fallback behavior";
    public static final String NO_CARD_MESSAGE = "No Card found";

    public static final String CARD_FETCH_ERROR = "Unable to Fetch Card";

    @Value("${operatorfabric.services.base-url.cards}")
    String cardBaseUrl;
    WebClient client;

    public CardConsultationClient() {
        this.client = WebClient.create();
    }

    public Mono<Card> fetchMonoCard(@PathVariable("id") String id, @RequestHeader("Authorization") String auth) {
        return this
                .client
                .get()
                .uri(this.cardBaseUrl + "/cards/{id}", id)
                .header("Authorization", auth)
                .retrieve()
                .onStatus(HttpStatus::is4xxClientError, response -> {
                    switch (response.rawStatusCode()) {
                        case 404:
                            return Mono.error(new ApiErrorException(ApiError.builder().status(HttpStatus.NOT_FOUND)
                                    .message(NO_CARD_MESSAGE).build()));
                        case 401:
                            return Mono.error(new ApiErrorException(ApiError.builder().status(HttpStatus.UNAUTHORIZED)
                                    .message(CARD_401_MESSAGE).build()));
                        case 403:
                            return Mono.error(new ApiErrorException(ApiError.builder().status(HttpStatus.UNAUTHORIZED)
                                    .message(CARD_403_MESSAGE).build()));
                        default:
                            return Mono.error(new ApiErrorException(ApiError.builder().status(HttpStatus.BAD_GATEWAY)
                                    .message(CARD_ERROR_MESSAGE).build()));
                    }
                })
                .bodyToMono(Card.class)
                .onErrorResume( m ->
                                Mono.error(new ApiErrorException(ApiError
                                        .builder()
                                        .status(HttpStatus.NOT_FOUND)
                                        .message(CARD_FETCH_ERROR)
                                        .build()))
                                );
    }
}
