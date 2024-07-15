/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.publication.mocks;

import java.io.IOException;

import org.opfab.cards.publication.repositories.ProcessRepository;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;

import org.opfab.businessconfig.model.Process;


public class ProcessRepositoryMock implements ProcessRepository  {

    
    private Map<String, Process> processes = new HashMap<>();
    private ObjectMapper objectMapper = new ObjectMapper();


    public ProcessRepositoryMock() {
        String process1 = "{\"id\":\"process1\",\"states\":{\"state1\":{\"name\":\"state1\"}}}";
        String process2 = "{\"id\":\"process2\",\"states\":{\"state2\":{\"name\":\"state1\"}}}";
        String process3 = "{\"id\":\"process3\",\"states\":{\"state3\":{\"name\":\"state1\"}}}";
        String process4 = "{\"id\":\"process4\",\"states\":{\"state4\":{\"name\":\"state1\"}}}";
        String process5 = "{\"id\":\"process5\",\"states\":{\"state5\":{\"name\":\"state1\"}}}";
        String processCardUser = "{\"id\":\"PROCESS_CARD_USER\",\"states\":{\"state1\":{\"name\":\"state1\"}}}";
        setProcessAsString(process1, "0");
        setProcessAsString(process2, "0");
        setProcessAsString(process3, "0");
        setProcessAsString(process4, "0");
        setProcessAsString(process5, "0");
        setProcessAsString(processCardUser, "0");
    }

    private void setProcessAsString(String processAsString,String processVersion) {
        try {
            Process process = objectMapper.readValue(processAsString, Process.class);
            processes.put(process.getId()+ "." + processVersion, process);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public Process getProcess(String process, String processVersion)
            throws IOException, InterruptedException {
        return processes.get(process + "." + processVersion);
    }
    
}
