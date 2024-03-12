/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.businessconfig.controllers;

import lombok.extern.slf4j.Slf4j;
import org.opfab.businessconfig.model.*;
import org.opfab.businessconfig.model.Process;
import org.opfab.businessconfig.services.MonitoringService;
import org.opfab.businessconfig.services.ProcessesService;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.utilities.StringUtils;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import net.minidev.json.parser.ParseException;

@RestController
@Slf4j
@RequestMapping("/businessconfig")
public class BusinessconfigController {

    public static final String UNABLE_TO_LOAD_FILE_MSG = "Unable to load submitted file";
    public static final String UNABLE_TO_POST_FILE_MSG = "Unable to post submitted file";
    public static final String FILE = " file";
    public static final String LOCATION = "Location";
    public static final String IMPOSSIBLE_TO_UPDATE_BUNDLE = "Impossible to update bundle";
    private ProcessesService processService;
    private MonitoringService monitoringService;

    public BusinessconfigController(ProcessesService processService, MonitoringService monitoringService) {
        this.processService = processService;
        this.monitoringService = monitoringService;
    }

    @GetMapping(value = "/processes/{processId}/css/{cssFileName}", produces = { "application/json",
            "text/css" })
    public byte[] getCss(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("processId") String processId, @PathVariable("cssFileName") String cssFileName,
            String version) throws IOException {

        processId = StringUtils.sanitize(processId);
        cssFileName = StringUtils.sanitize(cssFileName);
        version = StringUtils.sanitize(version);

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

    @GetMapping(value = "/processes/{processId}/i18n", produces = { "application/json",
            "text/plain" })
    public byte[] getI18n(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("processId") String processId,
            @Valid @RequestParam(value = "version", required = false) String version)
            throws IOException {

        processId = StringUtils.sanitize(processId);
        version = StringUtils.sanitize(version);

        Resource resource = processService.fetchResource(processId, ResourceTypeEnum.I18N, version, "i18n");
        return loadResource(resource);
    }

    @GetMapping(value = "/processes/{processId}/templates/{templateName}", produces = { "application/json",
            "application/handlebars" })
    public byte[] getTemplate(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("processId") String processId,
            @PathVariable("templateName") String templateName,
            @Valid @RequestParam(value = "version", required = false) String version) throws IOException {

        processId = StringUtils.sanitize(processId);
        templateName = StringUtils.sanitize(templateName);
        version = StringUtils.sanitize(version);

        Resource resource;
        resource = processService.fetchResource(processId, ResourceTypeEnum.TEMPLATE, version, templateName);
        return loadResource(resource);
    }

    @GetMapping(value = "/processes/{processId}", produces = { "application/json" })
    public Process getProcess(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("processId") String processId,
            @Valid @RequestParam(value = "version", required = false) String version) {
        Process process = processService.fetch(processId, version);
        if (process == null) {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.NOT_FOUND)
                    .message(String.format("Process with id %s was not found", processId))
                    .build());
        }
        return process;
    }

    @GetMapping(value = "/processes", produces = { "application/json" })
    public List<Process> getProcesses(HttpServletRequest request, HttpServletResponse response,
            @Valid @RequestParam(value = "allVersions", required = false) Boolean allVersions) {
        return processService.listProcesses(allVersions);
    }

    @GetMapping(value = "/processgroups", produces = { "application/json" })
    public ProcessGroups getProcessgroups(HttpServletRequest request, HttpServletResponse response) {
        return processService.getProcessGroupsCache();
    }

    @PostMapping(value = "/processes", produces = { "application/json" }, consumes = {
            "multipart/form-data" })
    public Process uploadBundle(HttpServletRequest request, HttpServletResponse response,
            @Valid @RequestPart("file") MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            Process result = processService.updateProcess(is);
            if (result == null) {
                log.error(IMPOSSIBLE_TO_UPDATE_BUNDLE);
                throw new ApiErrorException(
                        ApiError.builder()
                                .status(HttpStatus.BAD_REQUEST)
                                .message(IMPOSSIBLE_TO_UPDATE_BUNDLE)
                                .error(IMPOSSIBLE_TO_UPDATE_BUNDLE)
                                .build(),
                        UNABLE_TO_LOAD_FILE_MSG);
            }
            response.addHeader(LOCATION, request.getContextPath() + "/businessconfig/processes/" + result.id());
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
                    UNABLE_TO_LOAD_FILE_MSG, e);
        } catch (IOException e) {
            log.error("IOException while loading bundle file", e);
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message("unable to load submitted file")
                            .error(e.getMessage())
                            .build(),
                    UNABLE_TO_LOAD_FILE_MSG, e);
        }
    }

    @PostMapping(value = "/processgroups", produces = { "application/json" }, consumes = {
            "multipart/form-data" })
    public Void uploadProcessgroups(HttpServletRequest request, HttpServletResponse response,
            @Valid @RequestPart("file") MultipartFile file) {
        return uploadFile(request, response, file, "processgroups", null);
    }

    @DeleteMapping(value = "/processes", produces = { "application/json" })
    public Void clearProcesses(HttpServletRequest request, HttpServletResponse response) throws IOException {
        processService.clear();
        response.setStatus(204);
        return null;
    }

    private ProcessStates getState(HttpServletRequest request, HttpServletResponse response, String processId,
            String stateName, String version) {
        ProcessStates state = null;
        Process process = getProcess(request, response, processId, version);
        if (process != null) {
            state = process.states().get(stateName);
            if (state == null) {
                throw new ApiErrorException(
                        ApiError.builder()
                                .status(HttpStatus.NOT_FOUND)
                                .message("Unknown state for businessconfig party service process")
                                .build(),
                        UNABLE_TO_LOAD_FILE_MSG);
            }
        } else {
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.NOT_FOUND)
                            .message("Unknown process")
                            .build(),
                    UNABLE_TO_LOAD_FILE_MSG);
        }
        return state;
    }

    @GetMapping(value = "/processes/{processId}/{state}/response", produces = {
            "application/json" })
    public Response getResponse(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("processId") String processId,
            @PathVariable("state") String stateName,
            @Valid @RequestParam(value = "version", required = false) String version) {
        return getState(request, response, processId, stateName, version)
                .response();
    }

    @DeleteMapping(value = "/processes/{processId}", produces = { "application/json" })
    public Void deleteBundle(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("processId") String processId)
            throws ApiErrorException {
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

    @DeleteMapping(value = "/processes/{processId}/versions/{version}", produces = {
            "application/json" })
    public Void deleteBundleVersion(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("processId") String processId,
            @PathVariable("version") String version) throws ApiErrorException {
        try {
            processService.deleteVersion(processId, version);
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

    @GetMapping(value = "/monitoring", produces = { "application/json" })
    public Monitoring getMonitoring(HttpServletRequest request, HttpServletResponse response) {
        return monitoringService.getMonitoring();
    }

    @PostMapping(value = "/monitoring", produces = { "application/json" }, consumes = {
            "application/json" })
    public Void postMonitoring(HttpServletRequest request, HttpServletResponse response,
            @Valid @RequestBody Monitoring monitoring) throws IOException {
        monitoringService.setMonitoring(monitoring);
        response.setStatus(201);
        return null;
    }

    public Void uploadFile(HttpServletRequest request, HttpServletResponse response, @Valid MultipartFile file,
            String endPointName, String resourceName) {

        resourceName = StringUtils.sanitize(resourceName);

        try {
            if (endPointName.equals("processgroups"))
                processService.updateProcessGroupsFile(new String(file.getBytes()));
            if (endPointName.equals("realtimescreens"))
                processService.updateRealTimeScreensFile(new String(file.getBytes()));
            if (endPointName.equals("businessdata"))
                processService.updateBusinessDataFile(new String(file.getBytes()), resourceName);

            response.addHeader(LOCATION, request.getContextPath() + "/businessconfig/" + endPointName);
            response.setStatus(201);
            return null;
        } catch (FileNotFoundException e) {
            log.error("File not found while loading " + endPointName + FILE, e);
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message("Incorrect inner file structure")
                            .error(e.getMessage())
                            .build(),
                    UNABLE_TO_LOAD_FILE_MSG, e);
        } catch (IOException e) {
            log.error("IOException while loading " + endPointName + FILE, e);
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message("unable to load submitted file")
                            .error(e.getMessage())
                            .build(),
                    UNABLE_TO_LOAD_FILE_MSG, e);
        } catch (ParseException e) {
            log.error("ParseException while posting the " + resourceName + FILE, e);
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message("The file " + resourceName + " is not json compliant")
                            .error(e.getMessage())
                            .build(),
                    UNABLE_TO_POST_FILE_MSG, e);
        }
    }

    @PostMapping(value = "/realtimescreens", produces = { "application/json" }, consumes = {
            "multipart/form-data" })
    public Void uploadRealTimeScreens(HttpServletRequest request, HttpServletResponse response,
            @Valid @RequestPart("file") MultipartFile file) {
        return uploadFile(request, response, file, "realtimescreens", null);
    }

    @GetMapping(value = "/realtimescreens", produces = { "application/json" })
    public RealTimeScreens getRealTimeScreens(HttpServletRequest request, HttpServletResponse response) {
        return processService.getRealTimeScreensCache();
    }

    @GetMapping(value = "/processhistory/{processId}", produces = {
            "application/json" })
    public List<Process> getProcessHistory(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("processId") String processId) {
        List<Process> history = processService.listProcessHistory(processId);

        if (history.isEmpty()) {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.NOT_FOUND)
                    .message(String.format("History for process with id %s was not found", processId))
                    .build());
        }
        return history;
    }

    @GetMapping(value = "/businessData/{resourceName}", produces = {
            "application/json" })
    public byte[] getBusinessData(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("resourceName") String resourceName)
            throws IOException {

        resourceName = StringUtils.sanitize(resourceName);

        Resource resource;
        resource = processService.getBusinessData(resourceName);
        return loadResource(resource);
    }

    @GetMapping(value = "/businessData", produces = { "application/json" })
    public String getAllBusinessData(HttpServletRequest request, HttpServletResponse response) throws IOException {
        return processService.getAllBusinessData();
    }

    @DeleteMapping(value = "/businessData", produces = { "application/json" })
    public Void deleteAllBusinessData(HttpServletRequest request, HttpServletResponse response) throws IOException {
        processService.deleteAllBusinessData();
        return null;
    }

    @PostMapping(value = "/businessData/{resourceName}", produces = { "application/json" }, consumes = {
            "multipart/form-data" })
    public Void uploadBusinessData(HttpServletRequest request, HttpServletResponse response,
            @Valid @RequestPart("file") MultipartFile file,
            @PathVariable("resourceName") String resourceName) {
        return uploadFile(request, response, file, "businessdata", resourceName);
    }

    @DeleteMapping(value = "/businessData/{resourceName}", produces = {
            "application/json" })
    public Void deleteBusinessData(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("resourceName") String resourceName)
            throws ApiErrorException {

        resourceName = StringUtils.sanitize(resourceName);

        try {
            processService.deleteFile(resourceName);
            // leaving response body empty
            response.setStatus(204);
            return null;
        } catch (FileNotFoundException e) {
            log.error("Resource not found", e);
            throw new ApiErrorException(ApiError.builder().status(HttpStatus.NOT_FOUND)
                    .message("Resource not found").error(e.getMessage()).build(),
                    "Resource directory not found", e);
        } catch (IOException e) {
            String message = "IOException while deleting resource file";
            log.error(message, e);
            throw new ApiErrorException(ApiError.builder().status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .message("unable to delete submitted resource").error(e.getMessage()).build(),
                    message, e);
        }
    }

}
