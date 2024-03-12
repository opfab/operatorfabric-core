/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.repositories;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.opfab.users.model.UserSettings;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;
import com.fasterxml.jackson.core.JsonProcessingException;

@Slf4j
@Service
public class SettingsRepositoryImpl implements SettingsRepository {

    private String usersUrl;
    private ObjectMapper objectMapper = new ObjectMapper();

    public SettingsRepositoryImpl(@Value("${operatorfabric.servicesUrls.users:http://users:2103}") String usersUrl) {
        this.usersUrl = usersUrl;
    }

    public void patchUserSettings(String token, String login, UserSettings settings) {

        String settingsJson;
        try {
            settingsJson = objectMapper.writeValueAsString(settings);
        } catch (JsonProcessingException e) {
            log.error("Error converting settings to JSON", e);
            return;
        }

        String bearer = "Bearer " + token;
        String uri = String.format("%s/users/%s/settings", usersUrl, login);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(uri))
                .header("Authorization", bearer)
                .header("Content-Type", "application/json")
                .method("PATCH", HttpRequest.BodyPublishers.ofString(settingsJson))
                .build();

        try {
            HttpClient httpClient = HttpClient.newHttpClient();
            httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException e) {
            log.error("Error patching user settings", e);
        } catch (InterruptedException e) {
            log.error("Error patching user settings", e);
            Thread.currentThread().interrupt(); // Restore the interrupt status
        }
    }
}