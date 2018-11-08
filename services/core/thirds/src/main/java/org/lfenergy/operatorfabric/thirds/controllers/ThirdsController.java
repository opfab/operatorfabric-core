package org.lfenergy.operatorfabric.thirds.controllers;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.lfenergy.operatorfabric.thirds.model.ResourceTypeEnum;
import org.lfenergy.operatorfabric.thirds.model.Third;
import org.lfenergy.operatorfabric.thirds.services.ThirdsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

/**
 * ThirdController, documented at {@link ThirdsApi}
 *
 * @author David Binder
 */
@RestController
@Slf4j
public class ThirdsController implements ThirdsApi {

//  @Autowired
  private ThirdsService service;

  @Autowired
  public ThirdsController(ThirdsService service) {
    this.service = service;
  }

  @Override
  public byte[] getCss(String thirdName, String cssFileName, String apiVersion) throws IOException {
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
  public byte[] getI18n(String thirdName, String locale, String apiVersion) throws IOException {
    Resource resource = service.fetchResource(thirdName, ResourceTypeEnum.I18N, apiVersion, locale, null);
    return loadResource(resource);
  }

  @Override
  public byte[] getMedia(String thirdName, String mediaFileName, String locale, String apiVersion) throws IOException {
    Resource resource = service.fetchResource(thirdName, ResourceTypeEnum.MEDIA, apiVersion, locale, mediaFileName);
    return loadResource(resource);
  }

  @Override
  public byte[] getTemplate(String thirdName, String templateName, String locale, String apiVersion) throws
     IOException {
    Resource resource;
    resource = service.fetchResource(thirdName, ResourceTypeEnum.TEMPLATE, apiVersion, locale, templateName);
    return loadResource(resource);
  }

  @Override
  public Third getThird(@PathVariable String thirdName, String apiVersion) {
    return service.fetch(thirdName, apiVersion);
  }

  @Override
  public List<Third> getThirds() {
    return service.listThirds();
  }

  @Override
  public Third uploadBundle(String thirdName, @Valid MultipartFile file) throws IOException, ApiErrorException {
    try (InputStream is = file.getInputStream()) {
      return service.updateThird(is);
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


}