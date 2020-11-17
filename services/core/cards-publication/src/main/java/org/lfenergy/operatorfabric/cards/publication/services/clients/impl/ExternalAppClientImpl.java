package org.lfenergy.operatorfabric.cards.publication.services.clients.impl;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.publication.kafka.producer.ResponseCardProducer;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.services.clients.ExternalAppClient;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@Slf4j
public class ExternalAppClientImpl implements ExternalAppClient {

    public static final String REMOTE_404_MESSAGE = "Specified external application was not handle by businessconfig party endpoint (not found)";
    public static final String UNEXPECTED_REMOTE_MESSAGE = "Unexpected behaviour of businessconfig party handler endpoint";
    public static final String EMPTY_URL_MESSAGE = "Url Specified for external application is empty";
    public static final String NO_EXTERNALRECIPIENTS_MESSAGE = "No external recipients found in the card";
    public static final String ERR_CONNECTION_REFUSED = "No external recipients found in the card";

    @Value("#{${externalRecipients-url}}")
    private Map<String, String> externalRecipients;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ResponseCardProducer responseCardProducer;

    public void sendCardToExternalApplication(CardPublicationData card) {

        Optional<List<String>> externalRecipientsFromCard = Optional.ofNullable(card.getExternalRecipients());

        if (externalRecipientsFromCard.isPresent() && !externalRecipientsFromCard.get().isEmpty()) {

            externalRecipientsFromCard.get().stream()
                    .forEach(item -> {
                        String externalRecipientUrl = externalRecipients
                                .entrySet()
                                .stream()
                                .filter(x -> x.getKey().contains(item))
                                .map(x -> x.getValue())
                                .findFirst()
                                .orElseThrow(() -> new ApiErrorException(ApiError.builder()
                                        .status(HttpStatus.BAD_GATEWAY)
                                        .message(EMPTY_URL_MESSAGE)
                                        .build()));
                        callExternalApplication(card, externalRecipientUrl);
                    });
        }else {
            log.warn("No external recipients found in the card {}", card.getId(), card.getPublisher());
        }
    }

    private void callExternalApplication(CardPublicationData card, String externalRecipientUrl) {
        if (externalRecipientUrl.startsWith("kafka://")) {
            callExternalKafkaApplication(card, externalRecipientUrl);
        } else{
            callExternalHttpApplication(card, externalRecipientUrl);
        }
    }

    private void callExternalKafkaApplication(CardPublicationData card, String externalRecipientUrl) {
        responseCardProducer.send(card);
    }

    private void callExternalHttpApplication(CardPublicationData card, String externalRecipientUrl) {
        try {
            log.debug("Start to Send card {} To {} ", card.getId(), card.getPublisher());

            HttpHeaders headers = new HttpHeaders();
            List<Charset> acceptCharset = Collections.singletonList(StandardCharsets.UTF_8);
            headers.setAcceptCharset(acceptCharset);
            headers.add("Accept", MediaType.APPLICATION_JSON_VALUE);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<CardPublicationData> requestBody = new HttpEntity<>(card, headers);

            restTemplate.postForObject(externalRecipientUrl, requestBody, CardPublicationData.class);

            log.debug("End to Send card {} \n", card);

        } catch (HttpClientErrorException.NotFound ex) {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.BAD_GATEWAY)
                    .message(REMOTE_404_MESSAGE)
                    .build());
        } catch (HttpClientErrorException | HttpServerErrorException ex) {
            throw new ApiErrorException(ApiError.builder()
                    .status(ex.getStatusCode())
                    .message(UNEXPECTED_REMOTE_MESSAGE)
                    .build());
        } catch (IllegalArgumentException ex) {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.BAD_GATEWAY)
                    .message(EMPTY_URL_MESSAGE)
                    .build());
        } catch (Exception ex) {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.BAD_GATEWAY)
                    .message(UNEXPECTED_REMOTE_MESSAGE)
                    .build());
        }

    }
}
