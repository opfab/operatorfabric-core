/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.repositories;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;

import org.opfab.utilities.eventbus.EventBus;
import org.opfab.utilities.eventbus.EventListener;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class I18NRepositoryImpl implements I18NRepository, EventListener {

    private String businessConfigUrl;
    private HashMap<String, JsonNode> i18nCache = new HashMap<>();

    public I18NRepositoryImpl(EventBus eventBus, String businessConfigUrl) {
        this.businessConfigUrl = businessConfigUrl;
        eventBus.addListener("process", this);
    }

    public JsonNode getI18n(String process, String processVersion) throws IOException, InterruptedException {
        String key = process + "." + processVersion;
        if (i18nCache.containsKey(key)) {
            return i18nCache.get(key);
        }
        String i18n = getI18NFromBusinessConfigService(process, processVersion);
        if (i18n==null) return null;

        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode = null;
        jsonNode = objectMapper.readTree(i18n);
        if (jsonNode != null) {
            i18nCache.put(key, jsonNode);
        }
        return jsonNode;
    }

    private String getI18NFromBusinessConfigService(String process, String processVersion)
            throws IOException, InterruptedException {

        HttpClient httpClient = HttpClient.newHttpClient();
        String uri = String.format(
                "%s/businessconfig/processes/%s/i18n?version=%s", businessConfigUrl, process, processVersion);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(uri))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 404)
            return null;

        return response.body();
    }

    @Override
    public void onEvent(String eventKey, String message) {
        i18nCache.clear();
    }
}
