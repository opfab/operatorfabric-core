/* Copyright (c) 2018, RTE (http://www.rte-france.com)
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
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * ThirdController, documented at {@link ThirdsApi}
 *
 * @author David Binder
 */
@RestController
@Slf4j
public class ThirdsController implements ThirdsApi {

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
  public byte[] getMedia(HttpServletRequest request, HttpServletResponse response, String thirdName, String mediaFileName, String locale, String apiVersion) throws IOException {
    Resource resource = service.fetchResource(thirdName, ResourceTypeEnum.MEDIA, apiVersion, locale, mediaFileName);
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
    return service.fetch(thirdName, apiVersion);
  }

  @Override
  public List<Third> getThirds(HttpServletRequest request, HttpServletResponse response) {
    return service.listThirds();
  }

  @Override
  public Third uploadBundle(HttpServletRequest request, HttpServletResponse response, @Valid MultipartFile file) {
    try (InputStream is = file.getInputStream()) {
      Third result = service.updateThird(is);
      response.addHeader("Location",request.getContextPath()+"/thirds/"+result.getName());
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
         "Unable to load submitted file"
         , e);
    } catch (IOException e) {
      log.error("IOException while loading bundle file", e);
      throw new ApiErrorException(
         ApiError.builder()
            .status(HttpStatus.BAD_REQUEST)
            .message("unable to load submitted file")
            .error(e.getMessage())
            .build(),
         "Unable to load submitted file"
         , e);
    }
  }

  @DeleteMapping
  public void clear() throws IOException {
    service.clear();
  }

  @Override
  public Map<String, ? extends Action> getActions(HttpServletRequest request, HttpServletResponse response, String thirdName, String processName, String stateName, String apiVersion) {
    ThirdStates state = getState(request, response, thirdName, processName, stateName, apiVersion);
    if(state!=null)
      return state.getActions();
    return Collections.emptyMap();
  }

  @Override
  public Action getAction(HttpServletRequest request, HttpServletResponse response, String thirdName, String processName, String stateName, String actionKey, String apiVersion) {
    ThirdStates state = getState(request, response, thirdName, processName, stateName, apiVersion);
    if(state!=null) {
      Map<String, ? extends Action> actions = state.getActions();
      if (actions != null && actions.containsKey(actionKey))
        return actions.get(actionKey);
    }
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
    ThirdStates state=null;
    Third third = getThird(request, response, thirdName, apiVersion);
    if(third != null){
      ThirdProcesses process = third.getProcesses().get(processName);
      if(process != null){
        state = process.getStates().get(stateName);
        if(state == null){
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.NOT_FOUND)
                            .message("Unknown state for third party service process")
                            .build(),
                    "Unable to load submitted file"
            );
        }
      }else{
          throw new ApiErrorException(
                  ApiError.builder()
                          .status(HttpStatus.NOT_FOUND)
                          .message("Unknown process for third party service")
                          .build(),
                  "Unable to load submitted file"
          );
      }
    }else{
      throw new ApiErrorException(
              ApiError.builder()
                      .status(HttpStatus.NOT_FOUND)
                      .message("Unknown third party service")
                      .build(),
              "Unable to load submitted file"
              );
    }
    return state;
  }

  @Override
  public List<? extends Detail> getDetails(HttpServletRequest request, HttpServletResponse response, String thirdName, String processName, String stateName, String apiVersion) {
    ThirdStates state = getState(request, response, thirdName, processName, stateName, apiVersion);
    if(state!=null)
      return state.getDetails();
    return Collections.emptyList();
  }
}
