package org.lfenergy.operatorfabric.thirds.services;

import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * <p></p>
 * Created on 17/04/18
 *
 * @author davibind
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest
@Slf4j
@ActiveProfiles("service_error")
public class ThirdsServiceWithWrongConfigurationShould {

  @Autowired
  ThirdsService service;

  @Test
  void listErroneousThirds() {
    Assertions.assertThat(service.listThirds()).hasSize(0);
  }
}
