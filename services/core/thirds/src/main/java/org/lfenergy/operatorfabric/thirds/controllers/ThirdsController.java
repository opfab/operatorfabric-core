/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.thirds.controllers;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.lfenergy.operatorfabric.thirds.model.*;
import org.lfenergy.operatorfabric.thirds.model.Process;
import org.lfenergy.operatorfabric.thirds.services.ProcessesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import java.util.Map;

/**
 * ThirdController, documented at {@link ThirdsApi}
 *
 */
@RestController
@Slf4j
public class ThirdsController implements ThirdsApi {

    public static final String UNABLE_TO_LOAD_FILE_MSG = "Unable to load submitted file";
    private ProcessesService service;

    @Autowired
    public ThirdsController(ProcessesService service) {
        this.service = service;
    }

    @Override
    public byte[] getCss(HttpServletRequest request, HttpServletResponse response, String processName, String cssFileName, String version) throws IOException {
        Resource resource = service.fetchResource(processName, ResourceTypeEnum.CSS, version, cssFileName);
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
    public byte[] getI18n(HttpServletRequest request, HttpServletResponse response, String processName, String locale, String version) throws IOException {
        Resource resource = service.fetchResource(processName, ResourceTypeEnum.I18N, version, locale, null);
        return loadResource(resource);
    }


    @Override
    public byte[] getTemplate(HttpServletRequest request, HttpServletResponse response, String processName, String templateName, String locale, String version) throws
            IOException {
        Resource resource;
        resource = service.fetchResource(processName, ResourceTypeEnum.TEMPLATE, version, locale, templateName);
        return loadResource(resource);
    }

    @Override
    public Process getProcess(HttpServletRequest request, HttpServletResponse response, String processId, String version) {
        Process process = service.fetch(processId, version);
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
        return service.listProcesses();
    }

    @Override
    public Process uploadBundle(HttpServletRequest request, HttpServletResponse response, @Valid MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            Process result = service.updateProcess(is);
            response.addHeader("Location", request.getContextPath() + "/thirds/processes/" + result.getId());
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

    @DeleteMapping
    public void clear() throws IOException {
        service.clear();
    }

    private ProcessStates getState(HttpServletRequest request, HttpServletResponse response, String processName, String stateName, String version) {
        ProcessStates state = null;
        Process process = getProcess(request, response, processName, version);
        if (process != null) {
            state = process.getStates().get(stateName);
            if (state == null) {
                throw new ApiErrorException(
                        ApiError.builder()
                                .status(HttpStatus.NOT_FOUND)
                                .message("Unknown state for third party service process")
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
    public List<? extends Detail> getDetails(HttpServletRequest request, HttpServletResponse response, String processName, String stateName, String version) {
        return getState(request, response, processName, stateName, version)
                .getDetails();
    }

    @Override
    public Response getResponse(HttpServletRequest request, HttpServletResponse response, String processName,
                                String stateName, String version) {
        return getState(request, response, processName, stateName, version)
                .getResponse();
    }

	@Override
	public Void deleteBundle(HttpServletRequest request, HttpServletResponse response, String processName)
			throws Exception {
		try {
			service.delete(processName);
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
	public Void deleteBundleVersion(HttpServletRequest request, HttpServletResponse response, String processName,
			String version) throws Exception {
		try {
			service.deleteVersion(processName,version);
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
}
