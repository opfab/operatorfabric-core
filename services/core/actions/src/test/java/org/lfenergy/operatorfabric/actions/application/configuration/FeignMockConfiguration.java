package org.lfenergy.operatorfabric.actions.application.configuration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.Feign;
import feign.jackson.JacksonDecoder;
import feign.mock.HttpMethod;
import feign.mock.MockClient;
import feign.mock.MockTarget;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.actions.model.Action;
import org.lfenergy.operatorfabric.actions.model.ActionData;
import org.lfenergy.operatorfabric.actions.services.ActionServiceShould;
import org.lfenergy.operatorfabric.actions.services.feign.CardConsultationServiceProxy;
import org.lfenergy.operatorfabric.actions.services.feign.ThirdsServiceProxy;
import org.lfenergy.operatorfabric.cards.model.Card;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.openfeign.support.SpringMvcContract;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;


@Configuration
@Slf4j
public class FeignMockConfiguration {

    @Autowired
    ObjectMapper mapper;

    @Bean
    public MockClient mockClient() throws JsonProcessingException {

        //Create MockClient and set behaviour
        Card card = new Card();
        card.setPublisher("publisher");
        card.setProcess("process");
        card.setProcessId("process-instance");
        card.setState("state");
        card.setData(new ActionServiceShould.TestClass1());

        Action action = ActionData.builder()
                .updateState(true)
                .url("http://somewhere:111/{process}/{state}/action?access_token={jwt}")
                .build();

        MockClient mockClient = new MockClient();
        mockClient = mockClient
                .ok(HttpMethod.GET, "/cards/"+card.getPublisher()+"_"+card.getProcessId(), mapper.writeValueAsString(card))
                .ok(HttpMethod.GET, "/cards/no_publisher_"+card.getProcessId(), "")
                .ok(HttpMethod.POST, "/cards/"+card.getPublisher()+"_"+card.getProcessId(), mapper.writeValueAsString(card))
                .ok(HttpMethod.POST, "/cards/no_publisher_"+card.getProcessId(), "")
                .ok(HttpMethod.GET, "/thirds/"+card.getPublisher()+"/"+card.getProcess()+"/"+card.getState()+"/actions/action1", mapper.writeValueAsString(action))
                .ok(HttpMethod.GET, "/thirds/no_publisher/"+card.getProcess()+"/"+card.getState()+"/actions/action1", "")
        ;

        return mockClient;
    }

    @Bean
    @Primary
    public CardConsultationServiceProxy mockCardService(MockClient mockClient) {

        //Build Feign with MockClient
        return Feign.builder()
                .decoder(new JacksonDecoder(mapper))
                .client(mockClient)
                .contract(new SpringMvcContract()) // Needed because spring-cloud-starter-feign implements a default Contract class "SpringMvcContract". See https://github.com/spring-cloud/spring-cloud-netflix/issues/760
                .target(new MockTarget<>(CardConsultationServiceProxy.class));


    }

    @Bean
    @Primary
    public ThirdsServiceProxy mockThirdsService(MockClient mockClient) {

        //Build Feign with MockClient
        return Feign.builder()
                .decoder(new JacksonDecoder(mapper))
                .client(mockClient)
                .contract(new SpringMvcContract()) // Needed because spring-cloud-starter-feign implements a default Contract class "SpringMvcContract". See https://github.com/spring-cloud/spring-cloud-netflix/issues/760
                .target(new MockTarget<>(ThirdsServiceProxy.class));


    }
}
