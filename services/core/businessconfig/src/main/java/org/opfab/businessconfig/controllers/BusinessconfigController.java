/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.businessconfig.controllers;

import lombok.extern.slf4j.Slf4j;
import org.opfab.businessconfig.model.Process;
import org.opfab.businessconfig.model.*;
import org.opfab.businessconfig.services.MonitoringService;
import org.opfab.businessconfig.services.ProcessesService;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

/**
 * BusinessconfigController, documented at {@link BusinessconfigApi}
 *
 */
@RestController
@Slf4j
public class BusinessconfigController implements BusinessconfigApi {

    public static final String UNABLE_TO_LOAD_FILE_MSG = "Unable to load submitted file";
    private ProcessesService processService;
    private MonitoringService monitoringService;

    @Autowired
    public BusinessconfigController(ProcessesService processService, MonitoringService monitoringService) {
        this.processService = processService;
        this.monitoringService = monitoringService;
    }

    @Override
    public byte[] getCss(HttpServletRequest request, HttpServletResponse response, String processId, String cssFileName, String version) throws IOException {
        Resource resource = processService.fetchResource(processId, ResourceTypeEnum.CSS, version, cssFileName);
        return loadResource(resource);
    }

    private byte[] loadResource(Resource resource) throws IOException {
        try (InputStream is = resource.getInputStream();
             ByteArrayOutputStream buffer = new ByteArrayOutputStream()) {
            int nRead;
            byte[] data = new byte[16384];

            while ((nRead = is.read(data, 0, data.length)) != -1) {
                buffer.write(data, 0, nRead);
            }
            buffer.flush();
            return buffer.toByteArray();
        }
    }

    @Override
    public byte[] getTranslation(HttpServletRequest request, HttpServletResponse response, String processId, String version) throws IOException {
        Resource resource = processService.fetchResource(processId, ResourceTypeEnum.TRANSLATION, version, "i18n");
        return loadResource(resource);
    }

    @Override
    public byte[] getTemplate(HttpServletRequest request, HttpServletResponse response, String processId, String templateName, String version) throws
            IOException {
        Resource resource;
        resource = processService.fetchResource(processId, ResourceTypeEnum.TEMPLATE, version, templateName);
        return loadResource(resource);
    }

    @Override
    public Process getProcess(HttpServletRequest request, HttpServletResponse response, String processId, String version) {
        Process process = processService.fetch(processId, version);
        if (process == null) {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.NOT_FOUND)
                    .message(String.format("Process with id %s was not found", processId))
                    .build());
        }
        return process;
    }

    @Override
    public List<Process> getProcesses(HttpServletRequest request, HttpServletResponse response) {
        return processService.listProcesses();
    }

    @Override
    public ProcessGroups getProcessgroups(HttpServletRequest request, HttpServletResponse response) {
        return processService.getProcessGroupsCache();
    }

    @Override
    public Process uploadBundle(HttpServletRequest request, HttpServletResponse response, @Valid MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            Process result = processService.updateProcess(is);
            response.addHeader("Location", request.getContextPath() + "/businessconfig/processes/" + result.getId());
            response.setStatus(201);
            return result;
        } catch (FileNotFoundException e) {
            log.error("File not found while loading bundle file", e);
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message("Incorrect inner file structure")
                            .error(e.getMessage())
                            .build(),
                    UNABLE_TO_LOAD_FILE_MSG
                    , e);
        } catch (IOException e) {
            log.error("IOException while loading bundle file", e);
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message("unable to load submitted file")
                            .error(e.getMessage())
                            .build(),
                    UNABLE_TO_LOAD_FILE_MSG
                    , e);
        }
    }

    @Override
    public Void uploadProcessgroups(HttpServletRequest request, HttpServletResponse response, @Valid MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            processService.updateProcessGroupsFile(is);
            response.addHeader("Location", request.getContextPath() + "/businessconfig/processgroups");
            response.setStatus(201);
            return null;
        } catch (FileNotFoundException e) {
            log.error("File not found while loading processgroups file", e);
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message("Incorrect inner file structure")
                            .error(e.getMessage())
                            .build(),
                    UNABLE_TO_LOAD_FILE_MSG
                    , e);
        } catch (IOException e) {
            log.error("IOException while loading processgroups file", e);
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message("unable to load submitted file")
                            .error(e.getMessage())
                            .build(),
                    UNABLE_TO_LOAD_FILE_MSG
                    , e);
        }
    }

    @Override
    public Void clearProcesses(HttpServletRequest request, HttpServletResponse response) throws Exception {
        processService.clear();
        response.setStatus(204);
        return null;
    }

    private ProcessStates getState(HttpServletRequest request, HttpServletResponse response, String processId, String stateName, String version) {
        ProcessStates state = null;
        Process process = getProcess(request, response, processId, version);
        if (process != null) {
            state = process.getStates().get(stateName);
            if (state == null) {
                throw new ApiErrorException(
                        ApiError.builder()
                                .status(HttpStatus.NOT_FOUND)
                                .message("Unknown state for businessconfig party service process")
                                .build(),
                        UNABLE_TO_LOAD_FILE_MSG
                );
            }
        } else {
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.NOT_FOUND)
                            .message("Unknown process")
                            .build(),
                    UNABLE_TO_LOAD_FILE_MSG
            );
        }
        return state;
    }

    @Override
    public Response getResponse(HttpServletRequest request, HttpServletResponse response, String processId,
                                String stateName, String version) {
        return getState(request, response, processId, stateName, version)
                .getResponse();
    }

	@Override
	public Void deleteBundle(HttpServletRequest request, HttpServletResponse response, String processId)
			throws Exception {
		try {
			processService.delete(processId);
			// leaving response body empty
			response.setStatus(204);
			return null;
		} catch (FileNotFoundException e) {
			log.error("Bundle directory not found when wanted to delete bundle", e);
			throw new ApiErrorException(ApiError.builder().status(HttpStatus.NOT_FOUND)
					.message("Bundle not found").error(e.getMessage()).build(),
					"Bundle directory not found", e);
		} catch (IOException e) {
			String message = "IOException while deleting bundle directory";
			log.error(message, e);
			throw new ApiErrorException(ApiError.builder().status(HttpStatus.INTERNAL_SERVER_ERROR)
					.message("unable to delete submitted bundle").error(e.getMessage()).build(),
					message, e);
		}
	}

	@Override
	public Void deleteBundleVersion(HttpServletRequest request, HttpServletResponse response, String processId,
			String version) throws Exception {
		try {
			processService.deleteVersion(processId,version);
			// leaving response body empty
			response.setStatus(204);
			return null;
		} catch (FileNotFoundException e) {
			log.error("Bundle directory not found when wanted to delete bundle", e);
			throw new ApiErrorException(ApiError.builder().status(HttpStatus.NOT_FOUND)
					.message("Bundle not found").error(e.getMessage()).build(),
					"Bundle directory not found", e);
		} catch (IOException e) {
			String message = "IOException while deleting bundle directory";
			log.error(message, e);
			throw new ApiErrorException(ApiError.builder().status(HttpStatus.INTERNAL_SERVER_ERROR)
					.message("unable to delete submitted bundle").error(e.getMessage()).build(),
					message, e);
		}
	}


    @Override
    public Monitoring getMonitoring(HttpServletRequest request, HttpServletResponse response) {
        return monitoringService.getMonitoring();
    }

    @Override
    public Void postMonitoring(HttpServletRequest request, HttpServletResponse response, @RequestBody Monitoring monitoring) throws Exception  {
        monitoringService.setMonitoring(monitoring);
        response.setStatus(201);
        return null;
    }


}
