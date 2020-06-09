package org.lfenergy.operatorfabric.externalApp.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;

import java.util.Optional;


@Service
public interface ExternalAppService {
	void displayMessage(Optional<JsonNode> requestBody);
	String WelcomeMessage();
}
