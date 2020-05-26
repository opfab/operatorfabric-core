/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.thirds.controllers;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.lfenergy.operatorfabric.thirds.model.*;
import org.lfenergy.operatorfabric.thirds.services.ThirdsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
    private ThirdsService service;

    @Autowired
    public ThirdsController(ThirdsService service) {
        this.service = service;
    }

    @Override
    public byte[] getCss(HttpServletRequest request, HttpServletResponse response, String thirdName, String cssFileName, String apiVersion) throws IOException {
        Resource resource = service.fetchResource(thirdName, ResourceTypeEnum.CSS, apiVersion, cssFileName);
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
    public byte[] getI18n(HttpServletRequest request, HttpServletResponse response, String thirdName, String locale, String apiVersion) throws IOException {
        Resource resource = service.fetchResource(thirdName, ResourceTypeEnum.I18N, apiVersion, locale, null);
        return loadResource(resource);
    }

    @Override
    public byte[] getTemplate(HttpServletRequest request, HttpServletResponse response, String thirdName, String templateName, String locale, String apiVersion) throws
            IOException {
        Resource resource;
        resource = service.fetchResource(thirdName, ResourceTypeEnum.TEMPLATE, apiVersion, locale, templateName);
        return loadResource(resource);
    }

    @Override
    public Third getThird(HttpServletRequest request, HttpServletResponse response, @PathVariable String thirdName, String apiVersion) {
        Third third = service.fetch(thirdName, apiVersion);
        if (third == null) {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.NOT_FOUND)
                    .message(String.format("Third with name %s was not found", thirdName))
                    .build());
        }
        return third;
    }

    @Override
    public List<Third> getThirds(HttpServletRequest request, HttpServletResponse response) {
        return service.listThirds();
    }

    @Override
    public Third uploadBundle(HttpServletRequest request, HttpServletResponse response, @Valid MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            Third result = service.updateThird(is);
            response.addHeader("Location", request.getContextPath() + "/thirds/" + result.getName());
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

    @Override
    public Map<String, ? extends Action> getActions(HttpServletRequest request, HttpServletResponse response, String thirdName, String processName, String stateName, String apiVersion) {
        return getState(request, response, thirdName, processName, stateName, apiVersion)
                .getActions();
    }

    @Override
    public Action getAction(HttpServletRequest request, HttpServletResponse response, String thirdName, String processName, String stateName, String actionKey, String apiVersion) {
        ThirdStates state = getState(request, response, thirdName, processName, stateName, apiVersion);
        Map<String, ? extends Action> actions = state.getActions();
        if (actions != null && actions.containsKey(actionKey))
            return actions.get(actionKey);
    String message = String.format("Unknown action for third party service process %s state %s and action key %s", processName, stateName, actionKey);
    throw new ApiErrorException(
            ApiError.builder()
                    .status(HttpStatus.NOT_FOUND)
                    .message(message)
                    .build(),
            message
    );
  }

    private ThirdStates getState(HttpServletRequest request, HttpServletResponse response, String thirdName, String processName, String stateName, String apiVersion) {
        ThirdStates state = null;
        Third third = getThird(request, response, thirdName, apiVersion);
        if (third != null) {
            ThirdProcesses process = third.getProcesses().get(processName);
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
                                .message("Unknown process for third party service")
                                .build(),
                        UNABLE_TO_LOAD_FILE_MSG
                );
            }
        } else {
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.NOT_FOUND)
                            .message("Unknown third party service")
                            .build(),
                    UNABLE_TO_LOAD_FILE_MSG
            );
        }
        return state;
    }

    @Override
    public List<? extends Detail> getDetails(HttpServletRequest request, HttpServletResponse response, String thirdName, String processName, String stateName, String apiVersion) {
        return getState(request, response, thirdName, processName, stateName, apiVersion)
                .getDetails();
    }

    @Override
    public Response getResponse(HttpServletRequest request, HttpServletResponse response, String thirdName, String processName,
                                String stateName, String apiVersion) {
        return getState(request, response, thirdName, processName, stateName, apiVersion)
                .getResponse();
    }

	@Override
	public Void deleteBundle(HttpServletRequest request, HttpServletResponse response, String thirdName)
			throws Exception {
		try {
			service.delete(thirdName);
			// leaving response body empty
			response.setStatus(204);
			return null;
		} catch (FileNotFoundException e) {
			log.error("Bundle directory not found when wanted to delete bundle", e);
			throw new ApiErrorException(ApiError.builder().status(HttpStatus.NOT_FOUND)
					.message("Bundle not found").error(e.getMessage()).build(),
					"Bundle directory not found", e);
		} catch (IOException e) {
			log.error("IOException while deleting bundle directory", e);
			throw new ApiErrorException(ApiError.builder().status(HttpStatus.INTERNAL_SERVER_ERROR)
					.message("unable to delete submitted bundle").error(e.getMessage()).build(),
					"IOException while deleting bundle directory", e);
		}
	}
}
