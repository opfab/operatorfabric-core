/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.utilities;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.compress.archivers.tar.TarArchiveEntry;
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream;
import org.apache.commons.compress.compressors.gzip.GzipCompressorInputStream;

import java.io.*;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;

/**
 * Path manipulation utility
 * <br>
 * <br>
 * <b>WARNING :</b>
 * The methods check for path manipulation vulnerabilities via the use of
 * an application base path.
 * IF THE APPLICATION BASE PATH IS NOT SET, THE
 * METHODS WILL NOT CHECK FOR PATH MANIPULATION VULNERABILITIES.
 */
@Slf4j
public class PathUtils {

  private static String applicationBasePath;

  private PathUtils() {
  }

  public static void setApplicationBasePath(String applicationBasePath) {
    log.info("PathUtils : Set application base path to {} for security checks", applicationBasePath);
    PathUtils.applicationBasePath = Paths.get(applicationBasePath).toAbsolutePath().toString();
  }

  /**
   * Extract absolute path from file
   * 
   * @param f source file
   * @return an absolute Path
   */
  public static Path getPath(File f) {
    return Paths.get(f.getAbsolutePath());
  }

  /**
   * move directory targeted by path
   * 
   * @param source origin directory
   * @param target target directory
   * @throws IOException if an I/O error occurs
   */
  public static void moveDir(Path source, Path target) throws IOException {
    copyDir(source, target);
    deleteDir(source);
  }

  /**
   * copy directory targeted by path
   * 
   * @param source origin directory
   * @param target target directory
   * @throws IOException if an I/O error occurs
   */
  public static void copyDir(Path source, Path target) throws IOException {
    throwExceptionIfPathIsOutsideOfApplicationBasePath(target);
    throwExceptionIfPathIsOutsideOfApplicationBasePath(source);
    Files.walkFileTree(source, new CopyDir(source, target));
  }

  private static void throwExceptionIfPathIsOutsideOfApplicationBasePath(Path path) throws IOException {
    if (isPathOutsideOfApplicationBasePath(path))
      throw new IOException("Path " + path.toAbsolutePath().normalize().toString() + " is not in application base path " + applicationBasePath);
  }

  public static boolean isPathOutsideOfApplicationBasePath(Path file) throws IOException {
    if (applicationBasePath == null)
      throw new IOException("applicationBasePath is null");

    return !file.toAbsolutePath().normalize().startsWith(applicationBasePath);
  }

  /**
   * delete directory targeted by path
   * 
   * @param source directoru to delete
   * @throws IOException if an I/O error occurs
   */
  public static void deleteDir(Path source) throws IOException {
    throwExceptionIfPathIsOutsideOfApplicationBasePath(source);
    if (source.toFile().exists())
      Files.walkFileTree(source, new DeleteDir());
    else
      throw new FileNotFoundException("Specified path to delete not found in file system");
  }

  /**
   * copy file targeted by path
   * 
   * @param source origin file
   * @param target target file
   * @throws IOException if an I/O error occurs
   */
  public static void copy(Path source, Path target) throws IOException {
    throwExceptionIfPathIsOutsideOfApplicationBasePath(target);
    throwExceptionIfPathIsOutsideOfApplicationBasePath(source);
    if (source.toFile().isDirectory())
      copyDir(source, target);
    else
      Files.copy(source, target);
  }

  /**
   * Delete the file or directory targeted by source path. Logging exception
   * instead of throwing them
   * 
   * @param source target path
   * @return true if target was deleted, false otherwise
   * @throws IOException 
   */
  public static boolean silentDelete(Path source) {
    try {
      if (isPathOutsideOfApplicationBasePath(source)) {
        log.error("Source " + source.toString() + " is not in application base path");
        return false;
      }
      if (source.toFile().exists()) {
        delete(source);
      }
      return true;
    } catch (IOException e) {
      log.warn("Unable to silent delete " + source.toString(), e);
      return false;
    }
  }

  /**
   * Delete the file or directory targeted by source path
   * 
   * 
   * @param source target path
   * @throws IOException if an I/O error occurs
   */
  public static void delete(Path source) throws IOException {
    throwExceptionIfPathIsOutsideOfApplicationBasePath(source);
    if (!source.toFile().exists())
      throw new FileNotFoundException(source.toAbsolutePath().toString() + " does not exist");
    if (source.toFile().isDirectory())
      deleteDir(source);
    else {
      log.debug("deleting {}", source.toString());
      Files.delete(source);
    }
  }

  /**
   * Unpack tar.gz file
   * 
   * 
   * @param is      tar.gz inputstream
   * @param outPath output folder
   * @throws IOException if an I/O error occurs
   */
  public static void unTarGz(InputStream is, Path outPath) throws IOException {
    throwExceptionIfPathIsOutsideOfApplicationBasePath(outPath);
    createDirIfNeeded(outPath);
    try (BufferedInputStream bis = new BufferedInputStream(is);
        GzipCompressorInputStream gzis = new GzipCompressorInputStream(bis);
        TarArchiveInputStream tis = new TarArchiveInputStream(gzis)) {
      TarArchiveEntry entry;
      // loop over tar entries
      while ((entry = tis.getNextTarEntry()) != null) {
        String fileName = entry.getName();
        throwExceptionIfPathIsOutsideOfApplicationBasePath(outPath.resolve(fileName));
        if (entry.isDirectory()) {
          // create empty folders
          createDirIfNeeded(outPath.resolve(fileName));
        } else {
          // copy entry to files
          Path curPath = outPath.resolve(fileName);
          createDirIfNeeded(curPath.getParent());
          // there is no security issue here as the path has been checked before via throwExceptionIfPathIsOutsideOfApplicationBasePath
          Files.copy(tis, curPath); //NOSONAR
        }
      }
    }
  }


  @SuppressWarnings("java:S6096") // there is no security issue here as the path has been checked before via throwExceptionIfPathIsOutsideOfApplicationBasePath
  private static void createDirIfNeeded(Path dir) throws IOException {
    if (!dir.toFile().exists()) {
      Files.createDirectories(dir);
    }
  }


  public static void copyInputStreamToFile(InputStream is, String outPath) throws IOException {
    throwExceptionIfPathIsOutsideOfApplicationBasePath(Paths.get(outPath));

    File targetFile = new File(outPath);

    java.nio.file.Files.copy(
        is,
        targetFile.toPath(),
        StandardCopyOption.REPLACE_EXISTING);
  }

}

/**
 * a visitor to copy all files of a directory recursively
 */
@AllArgsConstructor
@Slf4j
class CopyDir extends SimpleFileVisitor<Path> {

  private Path sourceDir;
  private Path targetDir;

  @Override
  public FileVisitResult preVisitDirectory(Path dir,
      BasicFileAttributes attributes) {
    Path newDir = targetDir.resolve(sourceDir.relativize(dir));
    try {
      Files.createDirectories(newDir);
    } catch (IOException ex) {
      log.error("error creating directory " + newDir.toString(), ex);
    }

    return FileVisitResult.CONTINUE;
  }

  @Override
  public FileVisitResult visitFile(Path file, BasicFileAttributes attributes) {
    try {
      Path targetFile = targetDir.resolve(sourceDir.relativize(file));
      Files.copy(file, targetFile);
    } catch (IOException ex) {
      log.error("error copying " + file.toString(), ex);
    }
    return FileVisitResult.CONTINUE;
  }
}

/**
 * a visitor to delete all files of a directory recursively
 */
@Slf4j
class DeleteDir extends SimpleFileVisitor<Path> {

  @Override
  public FileVisitResult visitFile(Path file, BasicFileAttributes attributes) {
    try {
      log.debug("deleting {}", file.toString());
      Files.delete(file);
    } catch (IOException ex) {
      log.error("error deleting {}" + file.toString(), ex);
    }
    return FileVisitResult.CONTINUE;
  }

  @Override
  public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
    Files.delete(dir);
    return FileVisitResult.CONTINUE;
  }
}
