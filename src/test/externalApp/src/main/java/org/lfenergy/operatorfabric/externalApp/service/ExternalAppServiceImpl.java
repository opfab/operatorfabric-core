package org.lfenergy.operatorfabric.externalApp.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class ExternalAppServiceImpl implements ExternalAppService {

	@Override
	public void displayMessage(Optional<JsonNode> requestBody) {
		log.info("card reception from Card Publication Service {} : \n\n", requestBody);
	}

	public String WelcomeMessage() {
		return   "Welcome to External Application";
	}

}
