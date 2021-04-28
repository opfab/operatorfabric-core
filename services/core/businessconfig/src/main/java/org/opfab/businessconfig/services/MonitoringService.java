/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.businessconfig.services;

import org.opfab.businessconfig.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ResourceLoaderAware;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;

import javax.annotation.PostConstruct;

import com.fasterxml.jackson.databind.ObjectMapper;


@Service
@Slf4j
public class MonitoringService implements ResourceLoaderAware {

	private static final String PATH_PREFIX = "file:";

    @Value("${operatorfabric.businessconfig.storage.path}")
    private String storagePath;

    private ResourceLoader resourceLoader;
    private ObjectMapper objectMapper;
    private Monitoring monitoring;

    @Autowired
    public MonitoringService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void loadMonitoringFormFile() {
        try {
            Path rootPath = Paths
                    .get(this.resourceLoader.getResource(PATH_PREFIX + this.storagePath).getFile().getAbsolutePath())
                    .normalize();

            File f = new File(rootPath.toString() + "/monitoring.json");
            
            if (f.exists() && f.isFile()) {
                log.info("loading monitoring.json file from {}", new File(storagePath).getAbsolutePath());
                this.monitoring = objectMapper.readValue(f, MonitoringData.class);
            }
            else log.info("No monitoring.json file found in {} ", rootPath.toString());
        }
        catch (IOException e) {
            log.warn("Unreadable monitoring.json file at  {}", storagePath);
        }
    }

    @Override
    public void setResourceLoader(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    public Monitoring getMonitoring() {
        return monitoring;
    }

    public void setMonitoring(Monitoring monitoring) throws IOException {
        this.monitoring =  monitoring;
        saveMonitoringFile();
    }

    private synchronized void saveMonitoringFile() throws IOException {
        Path rootPath = Paths
                .get(this.resourceLoader.getResource(PATH_PREFIX + this.storagePath).getFile().getAbsolutePath())
                .normalize();
        if (!rootPath.toFile().exists())
            throw new FileNotFoundException("No directory available to copy monitoring file");
        File f = new File(rootPath.toString() + "/monitoring.json");
        objectMapper.writeValue(f,this.monitoring);
    }

}
