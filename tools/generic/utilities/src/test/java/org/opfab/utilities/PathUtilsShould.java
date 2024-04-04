/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.utilities;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
@TestMethodOrder(OrderAnnotation.class)
class PathUtilsShould {

  private static final Path basePath = Paths.get("build", "test-data");


  @AfterAll
  static void dispose() {
      PathUtils.silentDelete(basePath);
  }

  @Test
  @Order(1) 
  void handleErrorWhenApplicationBasePathisNotSet() {
    assertThatExceptionOfType(IOException.class).isThrownBy(() -> {
      Path testPath = Paths.get("/app/base/path/");
      PathUtils.isPathOutsideOfApplicationBasePath(testPath);
    }).withMessage("applicationBasePath is null");
  }

  @Test
  void copy() throws IOException {
    PathUtils.setApplicationBasePath("/");
    PathUtils.copy(basePath.resolve("dir"), basePath.resolve("target-copy-dir"));
    assertThat(basePath.resolve("target-copy-dir")).exists();
    assertThat(basePath.resolve("target-copy-dir").resolve("empty.file")).exists();
  }

  @Test
  void testCopyThrowsIOExceptionIfPathIsOutsideOfBasePath() {
    PathUtils.setApplicationBasePath("/opfab");
    assertThatExceptionOfType(IOException.class).isThrownBy(() -> {
      PathUtils.copy(basePath.resolve("dir"), basePath.resolve("target-copy-dir"));
    });
  }

  @Test
  void testPathOutsideOfBasePathWithTwoDots() throws IOException {
    PathUtils.setApplicationBasePath("/app/base/path");

    // Test a path that goes outside the base path using "../"
    Path testPath = Paths.get("/app/base/path/subdir/../..");
    assertTrue(PathUtils.isPathOutsideOfApplicationBasePath(testPath));

    // Test a path that stays within the base path using "../"
    testPath = Paths.get("/app/base/path/subdir/..");
    assertFalse(PathUtils.isPathOutsideOfApplicationBasePath(testPath));
  }

  @Test
  void move() throws IOException {
    PathUtils.setApplicationBasePath("/");
    PathUtils.moveDir(basePath.resolve("moveable-dir"), basePath.resolve("target-move-dir"));
    assertThat(basePath.resolve("target-move-dir")).exists();
    assertThat(basePath.resolve("target-move-dir").resolve("empty.file")).exists();
    assertThat(basePath.resolve("moveable-dir")).doesNotExist();
  }

  @Test
  void moveThrowsIOExceptionIfPathIsOutsideOfBasePath() {
    PathUtils.setApplicationBasePath("/opfab");
    assertThatExceptionOfType(IOException.class).isThrownBy(() -> {
      PathUtils.moveDir(basePath.resolve("moveable-dir"), basePath.resolve("target-move-dir"));
    });
  }

  @Test
  void delete() {
    PathUtils.setApplicationBasePath("/");
    PathUtils.silentDelete(basePath.resolve("deleteable-dir"));
    assertThat(basePath.resolve("deleteable-dir")).doesNotExist();
  }

  @Test
  void copyFile() throws IOException {
    PathUtils.setApplicationBasePath("/");
    PathUtils.copy(basePath.resolve("empty.file"), basePath.resolve("copied.file"));
    assertThat(basePath.resolve("copied.file")).exists();
  }

  @Test
  void copyFileThrowsIOExceptionIfPathIsOutsideOfBasePath() {
    PathUtils.setApplicationBasePath("/opfab");
    assertThatExceptionOfType(IOException.class).isThrownBy(() -> {
      PathUtils.copy(basePath.resolve("empty.file"), basePath.resolve("copied.file"));
    });
  }

  @Test
  void deleteFile() throws IOException {
    PathUtils.setApplicationBasePath("/");
    PathUtils.delete(basePath.resolve("deleteable.file"));
    assertThat(basePath.resolve("deleteable.file")).doesNotExist();
  }

  @Test
  void deleteFileThrowsIOExceptionIfPathIsOutsideOfBasePath() {
    PathUtils.setApplicationBasePath("/opfab");
    assertThatExceptionOfType(IOException.class).isThrownBy(() -> {
      PathUtils.delete(basePath.resolve("deleteable.file"));
    });
  }

  @Test
  void getPath() {
    PathUtils.setApplicationBasePath("/");
    File f = basePath.toFile();
    Path result = PathUtils.getPath(f);
    assertThat(result.normalize().toAbsolutePath()).hasToString(f.getAbsolutePath());
  }

  @Test
  void unTarGz() throws IOException {
    PathUtils.setApplicationBasePath("/");
    PathUtils.unTarGz(
        Files.newInputStream(basePath.resolve("archive.tar.gz")),
        basePath.resolve("archive-out"));
    assertThat(basePath.resolve("archive-out")).exists();
    assertThat(basePath.resolve("archive-out").resolve("dir")).exists();
    assertThat(basePath.resolve("archive-out").resolve("dir")).isDirectory();
    assertThat(basePath.resolve("archive-out").resolve("dir").resolve("empty.file")).exists();
    assertThat(basePath.resolve("archive-out").resolve("empty.file")).exists();
    assertThat(basePath.resolve("archive-out").resolve("dir").resolve("empty.file")).isRegularFile();
    assertThat(basePath.resolve("archive-out").resolve("empty.file")).isRegularFile();
  }

  @Test
  void handleErrorOnCopy() {
    PathUtils.setApplicationBasePath("/");
    assertThatExceptionOfType(IOException.class).isThrownBy(() -> {
      PathUtils.copy(
          basePath.resolve("dir").resolve("empty.file"),
          basePath.resolve("already-existing").resolve("empty.file"));
    });
    assertThatExceptionOfType(IOException.class).isThrownBy(() -> {
      PathUtils.copy(basePath.resolve("turlututu"), basePath.resolve("turlututu-copy"));
    });
  }

  @Test
  void handleErrorOnDelete() {
    PathUtils.setApplicationBasePath("/");
    assertThatExceptionOfType(IOException.class).isThrownBy(() -> {
      PathUtils.delete(
          basePath.resolve("dir2").resolve("empty.file"));
    });
    assertThatExceptionOfType(IOException.class).isThrownBy(() -> {
      PathUtils.deleteDir(
          basePath.resolve("dir2"));
    });
  }

}
