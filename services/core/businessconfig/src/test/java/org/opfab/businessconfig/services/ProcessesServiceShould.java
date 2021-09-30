/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.businessconfig.services;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.businessconfig.application.IntegrationTestApplication;
import org.opfab.businessconfig.model.Process;
import org.opfab.businessconfig.model.ProcessGroupData;
import org.opfab.businessconfig.model.ProcessGroupsData;
import org.opfab.utilities.PathUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;


import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.opfab.businessconfig.model.ResourceTypeEnum.*;
import static org.opfab.test.AssertUtils.assertException;
import static org.opfab.utilities.PathUtils.copy;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {IntegrationTestApplication.class})
@Slf4j
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ProcessesServiceShould {

    private static Path testDataDir = Paths.get("./build/test-data/businessconfig-storage");
    @Autowired
    private ProcessesService service;

    @BeforeEach
    void prepare() throws IOException {
        // Delete and recreate bundle directory to start with clean data 
        restoreBundleDirectory();
        service.loadCache();
        service.loadProcessGroupsCache();
    }

    @AfterAll
    void restoreBundleDirectory() throws IOException{
        if (Files.exists(testDataDir))  Files.walk(testDataDir, 1).forEach(PathUtils::silentDelete);
        copy(Paths.get("./src/test/docker/volume/businessconfig-storage"), testDataDir);

    }


    @Test
    void listProcesses() {
        assertThat(service.listProcesses()).hasSize(2);
    }

    @Test
    void fetch() {
        Process firstProcess = service.fetch("first");
        assertThat(firstProcess).hasFieldOrPropertyWithValue("version", "v1");
    }

    @Test
    void fetchWithVersion() {
        Process firstProcess = service.fetch("first", "0.1");
        assertThat(firstProcess).hasFieldOrPropertyWithValue("version", "0.1");
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
        File templateFile = service.fetchResource("first", TEMPLATE, null,null,"template1").getFile();
        assertThat(templateFile.getParentFile()).isDirectory().hasName("template");
        assertThat(templateFile)
                .exists()
                .isFile()
                .hasName("template1.handlebars")
                .hasContent("{{service}}");
        templateFile = service.fetchResource("first", TEMPLATE, "0.1", null, "template").getFile();
        assertThat(templateFile)
                .exists()
                .isFile()
                .hasName("template.handlebars")
                .hasContent("{{service}} 0.1");
        templateFile = service.fetchResource("first", TEMPLATE, "0.1", null, "template").getFile();
        assertThat(templateFile)
                .exists()
                .isFile()
                .hasName("template.handlebars")
                .hasContent("{{service}} 0.1");
    }

    @Test
    void fetchI18n() throws IOException {
        File i18nFile = service.fetchResource("first", I18N,null,"fr", null).getFile();
        assertThat(i18nFile)
                .exists()
                .isFile()
                .hasName("fr.json")
                .hasContent("card.title=\"Titre $1\"");
        i18nFile = service.fetchResource("first", I18N, "0.1", "fr", null).getFile();
        assertThat(i18nFile)
                .exists()
                .isFile()
                .hasName("fr.json")
                .hasContent("card.title=\"Titre $1 0.1\"");
        i18nFile = service.fetchResource("first", I18N, "0.1", "en", null).getFile();
        assertThat(i18nFile)
                .exists()
                .isFile()
                .hasName("en.json")
                .hasContent("card.title=\"Title $1 0.1\"");
    }

    @Test
    void fetchTranslation() throws IOException {
        File i18nFile = service.fetchResource("first", TRANSLATION,null,null, "i18n").getFile();
        assertThat(i18nFile)
                .exists()
                .isFile()
                .hasName("i18n.json")
                .hasContent("card.title=\"Title $1\"");
        i18nFile = service.fetchResource("first", TRANSLATION, "0.1", null, "i18n").getFile();
        assertThat(i18nFile)
                .exists()
                .isFile()
                .hasName("i18n.json")
                .hasContent("card.title=\"Title $1 0.1\"");
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
                        TEMPLATE,
                        "0.1",
                        null,
                        "template1")
                        .getInputStream()
        );
    }

    @Test
    public void testCheckNoDuplicateProcessInUploadedFile() {

        ProcessGroupData gp1 = ProcessGroupData.builder().id("gp1").processes(Arrays.asList("process1", "process2")).build();
        ProcessGroupData gp2 = ProcessGroupData.builder().id("gp2").processes(Arrays.asList("process3", "process4")).build();
        ProcessGroupData gp3 = ProcessGroupData.builder().id("gp3").processes(Arrays.asList("process5", "process4")).build();
        ProcessGroupData gp4 = ProcessGroupData.builder().id("gp4").processes(Arrays.asList("process7", "process8", "process7")).build();

        ProcessGroupsData groups_without_duplicate = ProcessGroupsData.builder().groups(Arrays.asList(gp1, gp2)).build();
        ProcessGroupsData groups_with_duplicate = ProcessGroupsData.builder().groups(Arrays.asList(gp2, gp3)).build();
        ProcessGroupsData groups_with_duplicate_in_the_same_group = ProcessGroupsData.builder().groups(Arrays.asList(gp1, gp4)).build();

        assertThat(service.checkNoDuplicateProcessInUploadedFile(groups_without_duplicate)).isTrue();
        assertThat(service.checkNoDuplicateProcessInUploadedFile(groups_with_duplicate)).isFalse();
        assertThat(service.checkNoDuplicateProcessInUploadedFile(groups_with_duplicate_in_the_same_group)).isFalse();
    }

    @Nested
    class CreateContent {
        @RepeatedTest(2)
        void updateProcess() throws IOException {
            Path pathToBundle = Paths.get("./build/test-data/bundles/second-2.0.tar.gz");
            try (InputStream is = Files.newInputStream(pathToBundle)) {
                Process process = service.updateProcess(is);
                assertThat(process).hasFieldOrPropertyWithValue("id", "second");
                assertThat(process).hasFieldOrPropertyWithValue("version", "2.0");
                assertThat(process.getStates().size()).isEqualTo(1);
                assertThat(process.getStates().get("firstState").getTemplateName()).isEqualTo("template");
                assertThat(process.getStates().get("firstState").getResponse().getExternalRecipients().size()).isEqualTo(2);
                assertThat(service.listProcesses()).hasSize(3);
            } catch (IOException e) {
                log.trace("rethrowing exception");
                throw e;
            }
        }

        @Nested
        class DeleteOnlyOneBusinessconfig {

            static final String bundleName = "first";

            static final String CONFIG_FILE_NAME = "config.json";

            @BeforeEach
            void prepare() throws IOException {
                // This will also delete the businessconfig-storage root folder, but in this case it's needed as
                // the following copy would fail if the folder already existed.
                if (Files.exists(testDataDir)) Files.walk(testDataDir, 1).forEach(PathUtils::silentDelete);
                copy(Paths.get("./src/test/docker/volume/businessconfig-storage"), testDataDir);
                service.loadCache();
            }

            @Test
            void deleteBundleByNameAndVersionWhichNotBeingDefault() throws Exception {
                Path bundleDir = testDataDir.resolve(bundleName);
                Path bundleVersionDir = bundleDir.resolve("0.1");
                Assertions.assertTrue(Files.isDirectory(bundleDir));
                Assertions.assertTrue(Files.isDirectory(bundleVersionDir));
                service.deleteVersion(bundleName,"0.1");
                Assertions.assertNull(service.fetch(bundleName, "0.1"));
                Process process = service.fetch(bundleName);
                Assertions.assertNotNull(process);
                Assertions.assertFalse(process.getVersion().equals("0.1"));
                Assertions.assertTrue(Files.isDirectory(bundleDir));
                Assertions.assertFalse(Files.isDirectory(bundleVersionDir));
            }

            @Test
            void deleteBundleByNameAndVersionWhichBeingDeafult1() throws Exception {
                Path bundleDir = testDataDir.resolve(bundleName);
                Process process = service.fetch(bundleName);
                Assertions.assertTrue(process.getVersion().equals("v1"));
                Path bundleVersionDir = bundleDir.resolve("v1");
                Path bundleNewDefaultVersionDir = bundleDir.resolve("0.1");
                FileUtils.touch(bundleNewDefaultVersionDir.toFile());//this is to be sure this version is the last modified
                Assertions.assertTrue(Files.isDirectory(bundleDir));
                Assertions.assertTrue(Files.isDirectory(bundleVersionDir));
                service.deleteVersion(bundleName,"v1");
                Assertions.assertNull(service.fetch(bundleName, "v1"));
                process = service.fetch(bundleName);
                Assertions.assertNotNull(process);
                Assertions.assertTrue(process.getVersion().equals("0.1"));
                Assertions.assertTrue(Files.isDirectory(bundleDir));
                Assertions.assertFalse(Files.isDirectory(bundleVersionDir));
                Assertions.assertTrue(Files.isDirectory(bundleNewDefaultVersionDir));
                Assertions.assertTrue(FileUtils.contentEquals(bundleDir.resolve(CONFIG_FILE_NAME).toFile(),
                        bundleNewDefaultVersionDir.resolve(CONFIG_FILE_NAME).toFile()));
            }

            @Test
            void deleteBundleByNameAndVersionWhichBeingDefault2() throws Exception {
                Path bundleDir = testDataDir.resolve(bundleName);
                final Process process = service.fetch(bundleName);
                Assertions.assertTrue(process.getVersion().equals("v1"));
                Path bundleVersionDir = bundleDir.resolve("v1");
                Path bundleNewDefaultVersionDir = bundleDir.resolve("0.5");
                FileUtils.touch(bundleNewDefaultVersionDir.toFile());//this is to be sure this version is the last modified
                Assertions.assertTrue(Files.isDirectory(bundleDir));
                Assertions.assertTrue(Files.isDirectory(bundleVersionDir));
                service.deleteVersion(bundleName,"v1");
                Assertions.assertNull(service.fetch(bundleName, "v1"));
                Process _process = service.fetch(bundleName);
                Assertions.assertNotNull(_process);
                Assertions.assertTrue(_process.getVersion().equals("0.5"));
                Assertions.assertTrue(Files.isDirectory(bundleDir));
                Assertions.assertFalse(Files.isDirectory(bundleVersionDir));
                Assertions.assertTrue(Files.isDirectory(bundleNewDefaultVersionDir));
                Assertions.assertTrue(FileUtils.contentEquals(bundleDir.resolve(CONFIG_FILE_NAME).toFile(),
                        bundleNewDefaultVersionDir.resolve(CONFIG_FILE_NAME).toFile()));
            }

            @Test
            void deleteBundleByNameAndVersionWhichNotExisting() throws Exception {
                Assertions.assertThrows(FileNotFoundException.class, () -> {service.deleteVersion(bundleName,"impossible_someone_really_so_crazy_to_give_this_name_to_a_version");});
            }

            @Test
            void deleteBundleByNameWhichNotExistingAndVersion() throws Exception {
                Assertions.assertThrows(FileNotFoundException.class, () -> {service.deleteVersion("impossible_someone_really_so_crazy_to_give_this_name_to_a_bundle","1.0");});
            }

            @Test
            void deleteBundleByNameAndVersionHavingOnlyOneVersion() throws Exception {
                Path bundleDir = testDataDir.resolve("deletetest");
                Assertions.assertTrue(Files.isDirectory(bundleDir));
                service.deleteVersion("deletetest","2.1");
                Assertions.assertNull(service.fetch("deletetest","2.1"));
                Assertions.assertNull(service.fetch("deletetest"));
                Assertions.assertFalse(Files.isDirectory(bundleDir));
            }

            @Test
            void deleteGivenBundle() throws Exception {
                Path bundleDir = testDataDir.resolve(bundleName);
                Assertions.assertTrue(Files.isDirectory(bundleDir));
                service.delete(bundleName);
                Assertions.assertFalse(Files.isDirectory(bundleDir));
            }

            @Nested
            class DeleteContent {
                @Test
                void clean() throws IOException {
                    service.clear();
                    assertThat(service.listProcesses()).hasSize(0);
                }
            }
        }
    }
}
