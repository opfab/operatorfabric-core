
package org.lfenergy.operatorfabric.time.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.time.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.time.configuration.json.JacksonConfig;
import org.lfenergy.operatorfabric.time.model.ServerTimeData;
import org.lfenergy.operatorfabric.time.model.SpeedEnum;
import org.lfenergy.operatorfabric.time.model.TimeData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * <p></p>
 * Created on 06/08/18
 *
 * @author David Binder
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes={IntegrationTestApplication.class, JacksonConfig.class})
@ActiveProfiles(profiles = {"test"})
@Slf4j
public class ObjectMapperShould {

    @Autowired
    private ObjectMapper mapper;

    @Test
    public void readTime() throws IOException {
        String stringTime = "{" +
          "\"referenceTime\": 123," +
          "\"virtualTime\": 456," +
          "\"computedNow\": 789," +
          "\"speed\": \"X2\"" +
           "}";
        TimeData time = mapper.readValue(stringTime, TimeData.class);
        assertThat(time).isNotNull();
        assertThat(time).isInstanceOf(ServerTimeData.class);
        assertThat(time.getReferenceTime().toEpochMilli()).isEqualTo(123);
        assertThat(time.getVirtualTime().toEpochMilli()).isEqualTo(456);
        assertThat(time.getComputedNow().toEpochMilli()).isEqualTo(789);
        assertThat(time.getSpeed()).isEqualTo(SpeedEnum.X2);
    }
}
