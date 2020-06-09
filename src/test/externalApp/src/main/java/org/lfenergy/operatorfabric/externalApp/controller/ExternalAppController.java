package org.lfenergy.operatorfabric.externalApp.controller;

import com.fasterxml.jackson.databind.JsonNode;
import org.lfenergy.operatorfabric.externalApp.exception.ExternalAppException;
import org.lfenergy.operatorfabric.externalApp.service.ExternalAppServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;


@RestController
public class ExternalAppController {

    private ExternalAppServiceImpl externalAppServiceImpl;

    @Autowired
    public ExternalAppController(ExternalAppServiceImpl externalAppServiceImpl) {
        this.externalAppServiceImpl = externalAppServiceImpl;
    }

    @PostMapping("/test")
    @ResponseStatus(HttpStatus.OK)
    public void ExternalAppReponse(@RequestBody Optional<JsonNode> requestBody)  {
        requestBody.orElseThrow(() -> new IllegalArgumentException("No Request Body"));

        externalAppServiceImpl.displayMessage(requestBody);
    }

    @GetMapping("/")
    public String home() {
        return   externalAppServiceImpl.WelcomeMessage();
    }
}
