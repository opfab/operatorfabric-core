/* Copyright (c) 2023, RTE (http://www.rte-france.com)
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


    public void setProcessAsString(String processAsString,String processVersion) {
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
