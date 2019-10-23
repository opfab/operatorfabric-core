package org.lfenergy.operatorfabric.time.application.configuration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.Feign;
import feign.jackson.JacksonDecoder;
import feign.mock.HttpMethod;
import feign.mock.MockClient;
import feign.mock.MockTarget;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.model.Card;
import org.lfenergy.operatorfabric.time.services.feign.CardConsultationServiceProxy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.openfeign.support.SpringMvcContract;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

;

@Configuration
@Slf4j
public class CardFeignMockConfiguration {

    @Autowired
    ObjectMapper mapper;

    @Bean
    public MockClient mockClient() throws JsonProcessingException {

        //Create MockClient and set behaviour
        Card card1 = new Card();
        card1.setId("id1");
        card1.setStartDate(2300000l);
        Card card2 = new Card();
        card2.setId("id1");
        card2.setStartDate(1300000l);

        MockClient mockClient = new MockClient();
        mockClient = mockClient
                .ok(HttpMethod.GET, "/1000000/next", mapper.writeValueAsString(card1))
                .ok(HttpMethod.GET, "/1000000/previous", mapper.writeValueAsString(card2))
                .add(HttpMethod.GET, "/2000000/next", 404)
                .add(HttpMethod.GET, "/2000000/previous", 404)
        ;

        return mockClient;
    }

    @Bean
    @Primary
    public CardConsultationServiceProxy mockUserServiceProxy(MockClient mockClient) {

        //Build Feign with MockClient
        return Feign.builder()
                .decoder(new JacksonDecoder(mapper))
                .client(mockClient)
                .contract(new SpringMvcContract()) // Needed because spring-cloud-starter-feign implements a default Contract class "SpringMvcContract". See https://github.com/spring-cloud/spring-cloud-netflix/issues/760
                .target(new MockTarget<>(CardConsultationServiceProxy.class));


    }
}
