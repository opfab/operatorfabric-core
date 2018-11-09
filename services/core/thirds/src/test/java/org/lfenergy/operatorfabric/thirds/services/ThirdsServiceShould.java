/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.thirds.services;

import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.thirds.model.Third;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.Resource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.assertj.core.api.Assertions.assertThat;
import static org.lfenergy.operatorfabric.test.AssertUtils.assertException;
import static org.lfenergy.operatorfabric.thirds.model.ResourceTypeEnum.*;
import static org.lfenergy.operatorfabric.utilities.PathUtils.copy;
import static org.lfenergy.operatorfabric.utilities.PathUtils.silentDelete;


/**
 * <p></p>
 * Created on 16/04/18
 *
 * @author davibind
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest
@Slf4j
@ActiveProfiles("test")
class ThirdsServiceShould {

  private static Path testDataDir = Paths.get("./build/test-data/thirds-storage");
  @Autowired
  private ThirdsService service;

  @BeforeAll
  static void prepare() throws IOException {
    copy(Paths.get("./src/test/docker/volume/thirds-storage"), testDataDir);
  }

  @AfterAll
  static void dispose() throws IOException {
    if (Files.exists(testDataDir))
      Files.walk(testDataDir, 1).forEach(p -> silentDelete(p));
  }

  @Test
  void listThirds() {
    assertThat(service.listThirds()).hasSize(1);
  }

  @Test
  void fetch() {
    Third firstThird = service.fetch("first");
    assertThat(firstThird).hasFieldOrPropertyWithValue("version", "v1");
    assertThat(firstThird).hasFieldOrPropertyWithValue("defaultLocale", "fr");
    assertThat(firstThird.getLocales()).containsExactly("fr", "en");
  }

  @Test
  void fetchWithVersion() {
    Third firstThird = service.fetch("first", "0.1");
    assertThat(firstThird).hasFieldOrPropertyWithValue("version", "0.1");
  }

  @Test
  void fetchCss() throws IOException {
    File styleFile = service.fetchResource("first", CSS, "style1").getFile();
    assertThat(styleFile.getParentFile())
       .isDirectory()
       .doesNotHave(
          new Condition<>(f -> f.getName().equals("fr") || f.getName().equals("en"),
             "parent directory should not be a locale directory"));
    assertThat(styleFile)
       .exists()
       .isFile()
       .hasName("style1.css")
       .hasContent(".bold {\n" +
          "    font-weight: bold;\n" +
          "}");
    styleFile = service.fetchResource("first", CSS, "0.1", "style1").getFile();
    assertThat(styleFile)
       .exists()
       .isFile()
       .hasName("style1.css")
       .hasContent(".bold {\n" +
          "    font-weight: bolder;\n" +
          "}");
    styleFile = service.fetchResource("first", CSS, "0.1", "fr", "style1").getFile();
    assertThat(styleFile)
       .exists()
       .isFile()
       .hasName("style1.css")
       .hasContent(".bold {\n" +
          "    font-weight: bolder;\n" +
          "}");
  }

  @Test
  void fetchTemplate() throws IOException {
    File templateFile = service.fetchResource("first", TEMPLATE, "template1").getFile();
    assertThat(templateFile.getParentFile()).isDirectory().hasName("fr");
    assertThat(templateFile)
       .exists()
       .isFile()
       .hasName("template1.handlebars")
       .hasContent("{{service}} fr");
    templateFile = service.fetchResource("first", TEMPLATE, "0.1", null, "template").getFile();
    assertThat(templateFile)
       .exists()
       .isFile()
       .hasName("template.handlebars")
       .hasContent("{{service}} fr 0.1");
    templateFile = service.fetchResource("first", TEMPLATE, "0.1", "en", "template").getFile();
    assertThat(templateFile)
       .exists()
       .isFile()
       .hasName("template.handlebars")
       .hasContent("{{service}} en 0.1");
  }

  @Test
  void fetchI18n() throws IOException {
    File i18nFile = service.fetchResource("first", I18N, null).getFile();
    assertThat(i18nFile.getParentFile()).isDirectory().hasName("fr");
    assertThat(i18nFile)
       .exists()
       .isFile()
       .hasName("i18n.properties")
       .hasContent("card.title=\"Titre $1\"");
    i18nFile = service.fetchResource("first", I18N, "0.1", null, null).getFile();
    assertThat(i18nFile)
       .exists()
       .isFile()
       .hasName("i18n.properties")
       .hasContent("card.title=\"Titre $1 0.1\"");
    i18nFile = service.fetchResource("first", I18N, "0.1", "en", null).getFile();
    assertThat(i18nFile)
       .exists()
       .isFile()
       .hasName("i18n.properties")
       .hasContent("card.title=\"Title $1 0.1\"");
  }

  @Test
  void fetchMedia() throws IOException {
    File mediaFile = service.fetchResource("first", MEDIA, "bidon.txt").getFile();
    assertThat(mediaFile.getParentFile()).isDirectory().hasName("fr");
    assertThat(mediaFile)
       .exists()
       .isFile()
       .hasName("bidon.txt")
       .hasContent("BIDON");
    mediaFile = service.fetchResource("first", MEDIA, "0.1", null, "bidon.txt").getFile();
    assertThat(mediaFile)
       .exists()
       .isFile()
       .hasName("bidon.txt")
       .hasContent("BIDON 0.1");
    mediaFile = service.fetchResource("first", MEDIA, "0.1", "en", "bidon.txt").getFile();
    assertThat(mediaFile)
       .exists()
       .isFile()
       .hasName("bidon.txt")
       .hasContent("FOO 0.1");
  }

  @Test
  void fetchResourceError() {
    assertException(FileNotFoundException.class).isThrownBy(() ->
       service.fetchResource("what",
          TEMPLATE,
          "0.1",
          null,
          "template"));
    assertException(FileNotFoundException.class).isThrownBy(() ->
       service.fetchResource("first",
          TEMPLATE,
          "0.2",
          null,
          "template"));
    assertException(FileNotFoundException.class).isThrownBy(() ->
       service.fetchResource("first",
          CSS,
          "0.1",
          null,
          "styleWhat"));
    assertException(FileNotFoundException.class).isThrownBy(() ->
       service.fetchResource("first",
          MEDIA,
          "0.1",
          null,
          "sound"));
    assertException(FileNotFoundException.class).isThrownBy(() ->
       service.fetchResource("first",
          I18N,
          "0.1",
          "de",
          null));
    assertException(FileNotFoundException.class).isThrownBy(() ->
       service.fetchResource("first",
          TEMPLATE,
          "0.1",
          null,
          "template1")
          .getInputStream()
    );

    assertException(FileNotFoundException.class).isThrownBy(() -> {
      Resource resource = service.fetchResource("first",
         MEDIA,
         "0.1",
         "de",
         "bidon.txt");
      log.info(resource.toString());
    });
    assertException(FileNotFoundException.class).isThrownBy(() ->
       service.fetchResource("first",
          TEMPLATE,
          "0.1",
          "de",
          "template")
          .getInputStream()
    );
  }

  @Nested
  class CreateContent {
    @RepeatedTest(2)
    void updateThird() throws IOException {
      Path pathToBundle = Paths.get("./build/test-data/bundles/second-2.0.tar.gz");
      try (InputStream is = Files.newInputStream(pathToBundle)) {
        Third t = service.updateThird(is);
        assertThat(t).hasFieldOrPropertyWithValue("name", "second");
        assertThat(t).hasFieldOrPropertyWithValue("version", "2.0");
        assertThat(t).hasFieldOrPropertyWithValue("defaultLocale", "en");
        assertThat(t.getLocales()).containsExactly("fr", "en");
        assertThat(service.listThirds()).hasSize(2);
      } catch (IOException e) {
        log.trace("rethrowing exception");
        throw e;
      }
    }

    @Nested
    class DeleteContent {
      @Test
      void clean() throws IOException {
        service.clear();
        assertThat(service.listThirds()).hasSize(0);
      }
    }
  }
}