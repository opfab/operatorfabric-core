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

import org.opfab.businessconfig.model.Process;
import org.opfab.utilities.eventbus.EventBus;
import org.opfab.utilities.eventbus.EventListener;

import com.fasterxml.jackson.databind.ObjectMapper;

public class ProcessRepositoryImpl implements ProcessRepository, EventListener {

    private String businessConfigUrl;
    private HashMap<String, Process> processCache = new HashMap<>();
    private ObjectMapper objectMapper = new ObjectMapper();

    public ProcessRepositoryImpl(String businessConfigUrl, EventBus eventBus) {
        this.businessConfigUrl = businessConfigUrl;
        eventBus.addListener("process", this);
    }
    

    @Override
    public Process getProcess(String processID, String processVersion) throws IOException, InterruptedException {
        String key = processID + "." + processVersion;
        if (processCache.containsKey(key)) {
            return processCache.get(key);
        }
        Process process = getProcessFromBusinessConfigService(processID, processVersion);
        if (process != null) {
            processCache.put(key, process);
        }
        return process;
    }

    private Process getProcessFromBusinessConfigService(String processId, String processVersion)
            throws IOException, InterruptedException {

        String processAsString = getProcessAsStringFromBusinessConfigService(processId, processVersion);
        Process process = null;

        if (processAsString != null)
            process = objectMapper.readValue(processAsString, Process.class);

        return process;
    }

    private String getProcessAsStringFromBusinessConfigService(String processId, String processVersion)
            throws IOException, InterruptedException {

        String result = null;
        HttpClient httpClient = HttpClient.newHttpClient();
        String uri = String.format(
                "%s/businessconfig/processes/%s?version=%s", businessConfigUrl, processId, processVersion);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(uri))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 404)
            return null;
        result = response.body();

        return result;
    }

    @Override
    public void onEvent(String eventKey, String message) {
        processCache.clear();
    }

}
