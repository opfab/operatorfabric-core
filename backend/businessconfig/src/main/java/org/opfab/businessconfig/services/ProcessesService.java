/* Copyright (c) 2018-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.businessconfig.services;

import org.springframework.core.io.InputStreamResource;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import com.google.common.collect.HashBasedTable;
import com.google.common.collect.Table;
import org.apache.commons.io.FileUtils;

import net.minidev.json.parser.JSONParser;
import net.minidev.json.parser.ParseException;

import org.opfab.businessconfig.model.*;
import org.opfab.businessconfig.model.Process;
import org.opfab.error.model.ApiError;
import org.opfab.error.model.ApiErrorException;
import org.opfab.utilities.PathUtils;
import org.opfab.utilities.StringUtils;
import org.opfab.utilities.eventbus.EventBus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ResourceLoaderAware;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import jakarta.annotation.PostConstruct;
import jakarta.validation.ConstraintViolation;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.slf4j.LoggerFactory;
import org.slf4j.Logger;

@Service
public class ProcessesService implements ResourceLoaderAware {

    private static final String PATH_PREFIX = "file:";
    private static final String CONFIG_FILE_NAME = "config.json";
    private static final String BUNDLE_FOLDER = "/bundles";
    private static final String BUSINESS_DATA_FOLDER = "/businessdata/";
    private static final String DUPLICATE_PROCESS_IN_PROCESS_GROUPS_FILE = "There is a duplicate process in the file you have sent";
    private static final String PROCESS_EVENT_KEY = "process";

    @Value("${operatorfabric.businessconfig.storage.path}")
    private String storagePath;
    private ObjectMapper objectMapper;
    private Map<String, Process> currentProcessesCache;
    private Table<String, String, Process> allProcessVersionsCache;
    private ResourceLoader resourceLoader;
    private LocalValidatorFactoryBean validator;
    private ProcessGroups processGroupsCache;
    private RealTimeScreens realTimeScreensCache;
    private ProcessMonitoring processMonitoringCache;

    private UIMenu uiMenuCache;

    private EventBus eventBus;

    private static final Logger log = LoggerFactory.getLogger(ProcessesService.class);

    public ProcessesService(ObjectMapper objectMapper, LocalValidatorFactoryBean validator, EventBus eventBus) {
        this.objectMapper = objectMapper;
        this.allProcessVersionsCache = HashBasedTable.create();
        this.currentProcessesCache = new HashMap<>();
        this.validator = validator;
        this.eventBus = eventBus;
    }

    @PostConstruct
    private void init() {
        PathUtils.setApplicationBasePath(storagePath);
        loadCache();
        loadProcessGroupsCache();
        loadRealTimeScreensCache();
        loadProcessMonitoringCache();
        loadUIMenuCache();
    }

    public ProcessGroups getProcessGroupsCache() {
        return processGroupsCache;
    }

    public UIMenu getUIMenuCache() {
        return uiMenuCache;
    }

    /**
     * Lists all registered processes
     *
     * @return registered processes
     */
    public List<Process> listProcesses(Boolean allVersions) {
        if ((allVersions == null) || Boolean.FALSE.equals(allVersions)) {
            return new ArrayList<>(currentProcessesCache.values());
        } else {
            return new ArrayList<>(allProcessVersionsCache.values());
        }
    }

    /**
     * Lists all registered processes
     *
     * @return registered processes
     */
    public List<Process> listProcessHistory(String processId) {
        return allProcessVersionsCache.values().stream().filter(p -> p.id().equals(processId)).toList();
    }

    /**
     * Loads processGroups data to processGroupsCache
     */
    public void loadProcessGroupsCache() {

        this.processGroupsCache = new ProcessGroups(new ArrayList<>());
        try {
            Path rootPath = Paths
                    .get(this.storagePath)
                    .normalize();

            File f = new File(rootPath.toString() + "/processGroups.json");
            if (f.exists() && f.isFile()) {
                log.info("loading processGroups.json file from {}", new File(storagePath).getAbsolutePath());
                this.processGroupsCache = objectMapper.readValue(f, ProcessGroups.class);
            }
        } catch (JacksonException e) {
            log.warn("Unreadable processGroups.json file at  {}", storagePath);
        }
    }

    public void loadUIMenuCache() {
        this.uiMenuCache = new UIMenu(new ArrayList<>(), new ArrayList<>(), new ArrayList<>(), new ArrayList<>());

        try {
            Path rootPath = Paths.get(this.storagePath).normalize();
            File f = new File(rootPath.toString() + "/uimenu.json");
            if (f.exists() && f.isFile()) {
                log.info("loading uimenu.json file from {}", new File(storagePath).getAbsolutePath());

                this.uiMenuCache = objectMapper.readValue(f, UIMenu.class);
            }
        } catch (JacksonException e) {
            log.warn("Unreadable uimenu.json file at {}", storagePath);
        }
    }

    /**
     * Loads realTimeScreens data to realTimeScreensCache
     */
    public void loadRealTimeScreensCache() {

        this.realTimeScreensCache = new RealTimeScreens(new ArrayList<>());
        try {
            Path rootPath = Paths
                    .get(this.storagePath)
                    .normalize();

            File f = new File(rootPath.toString() + "/realtimescreens.json");
            if (f.exists() && f.isFile()) {
                log.info("loading realtimescreens.json file from {}", new File(storagePath).getAbsolutePath());
                this.realTimeScreensCache = objectMapper.readValue(f, RealTimeScreens.class);
            }
        } catch (JacksonException e) {
            log.warn("Unreadable realtimescreens.json file at  {}", storagePath);
        }
    }

    /**
     * Loads processmonitoring data to processMonitoringCache
     */
    private void loadProcessMonitoringCache() {

        this.processMonitoringCache = new ProcessMonitoring(null, null, null);
        try {
            Path rootPath = Paths
                    .get(this.storagePath)
                    .normalize();

            File f = new File(rootPath.toString() + "/processmonitoring.json");
            if (f.exists() && f.isFile()) {
                log.info("loading processmonitoring.json file from {}", new File(storagePath).getAbsolutePath());
                this.processMonitoringCache = objectMapper.readValue(f, ProcessMonitoring.class);
            }
        } catch (JacksonException e) {
            log.warn("Unreadable processmonitoring.json file at  {}", storagePath);
        }
    }

    /**
     * This method populate two caches:
     * - currentProcessesCache : contains current version of process
     * definitions in a map with process id as key
     * - allProcessVersionsCache : contains all versions of process definitions in a
     * two keys table (process id, version)
     *
     * These definitions are stored in instances of "Process" and are loaded from
     * "config.json" files.
     *
     * Each current process definition file is located in a process bundle folder .
     * In this folder, subfolders contains all process definition version files.
     *
     * Example of folder structure:
     * ..storagePath/bundles/
     * .....└── process1/
     * ........├── config.json (current version)
     * ........├── version1/
     * ........│....└── config.json (specific version)
     * ....... └── version2/
     * .............└── config.json (specific version)
     *
     *
     */
    public void loadCache() {
        Resource root = this.resourceLoader.getResource(PATH_PREFIX + storagePath + BUNDLE_FOLDER);
        File[] bundleDirectories;
        try {
            bundleDirectories = root.getFile().listFiles(File::isDirectory);
        } catch (IOException e) {
            log.warn("Impossible to read bundle repository  {}", PATH_PREFIX + storagePath + BUNDLE_FOLDER);
            return;
        }
        if (bundleDirectories != null) {
            for (File bundleDirectory : bundleDirectories) {
                Process process = getProcessFromConfigFile(bundleDirectory);
                if (process != null) {
                    currentProcessesCache.put(process.id(), process);
                    populateCacheWithProcessVersions(bundleDirectory);
                }
            }
        }
    }

    private Process getProcessFromConfigFile(File configFilePath) {
        File configFile = new File(configFilePath, CONFIG_FILE_NAME);
        if (!configFile.exists()) {
            log.warn("No config.json file at {}", configFilePath);
            return null;
        }
        try {
            Process process = objectMapper.readValue(configFile, Process.class);
            Optional<String> validationError = getConfigFileValidationErrors(process);
            if (validationError.isPresent()) {
                log.warn("Unreadable config.json file({}) because these validation errors: {}",
                        configFile.getAbsolutePath(), validationError.get());
                return null;
            }
            return process;
        } catch (Exception e) {
            log.warn("Unreadable config.json file " + configFile.getAbsolutePath(), e);
            return null;
        }
    }

    private void populateCacheWithProcessVersions(File bundleDir) {
        File[] versionDirs = bundleDir.listFiles(File::isDirectory);
        if (versionDirs != null) {
            for (File versionDir : versionDirs) {
                Process versionedProcess = getProcessFromConfigFile(versionDir);
                if (versionedProcess != null) {
                    allProcessVersionsCache.put(versionedProcess.id(), versionedProcess.version(),
                            versionedProcess);
                }
            }
        }
    }

    /**
     * Computes resource handle
     *
     * @param process Process
     * @param type    resource type
     * @param name    resource name
     * @return resource handle
     * @throws FileNotFoundException if corresponding file does not exist
     */
    public Resource fetchResource(String process, ResourceTypeEnum type, String name) throws FileNotFoundException {
        return fetchResource(process, type, null, name);
    }

    /**
     * Computes resource handle
     *
     * @param processId Process id
     * @param type      resource type
     * @param version   process configuration version
     * @param name      resource name
     * @return resource handle
     * @throws FileNotFoundException if corresponding file does not exist
     */
    public Resource fetchResource(String processId, ResourceTypeEnum type, String version,
            String name) throws FileNotFoundException {
        Map<String, Process> versions = allProcessVersionsCache.row(processId);
        if (versions.isEmpty())
            throw new FileNotFoundException("No resource exist for " + processId);

        Process process;
        String finalVersion = version;

        if ((version == null) || version.isEmpty()) {
            finalVersion = this.fetch(processId).version();
        }

        process = versions.get(finalVersion);

        if (process == null)
            throw new FileNotFoundException(
                    "Unknown version (" + finalVersion + ") for " + processId + " at " + this.storagePath);

        String resourcePath = PATH_PREFIX +
                storagePath +
                BUNDLE_FOLDER +
                File.separator +
                processId +
                File.separator +
                finalVersion +
                File.separator +
                type.getFolder() +
                File.separator +
                name + type.getSuffix();

        log.info("loading resource: {}", resourcePath);
        Resource resource = this.resourceLoader.getResource(resourcePath);
        if (!resource.exists()) {
            throw new FileNotFoundException(
                    "Unknown " + type + " resource for " + processId + ":" + version + " at " + resourcePath);
        }
        return resource;
    }

    /**
     * Fetch {@link Process} for specified id and default version
     *
     * @param id process id
     * @return fetch {@link Process} or null if it does not exist
     */
    public Process fetch(String id) {
        return fetch(id, null);
    }

    @Override
    public void setResourceLoader(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    /**
     * Updates or creates process from a new bundle
     *
     * @param is bundle input stream
     * @return the new or updated process data
     * @throws IOException if error arises during stream reading
     */
    public synchronized Process updateProcess(InputStream is) throws IOException {
        Path rootPath = Paths
                .get(this.storagePath)
                .normalize();
        if (!rootPath.toFile().exists())
            throw new FileNotFoundException("No directory available to unzip bundle");
        Path bundlePath = Paths.get(this.storagePath + BUNDLE_FOLDER).normalize();
        if (!bundlePath.toFile().exists()) {
            try {
                Files.createDirectories(bundlePath);
            } catch (IOException e) {
                log.error("Impossible to create the necessary folder {} ", bundlePath, e);
            }
        }

        // create a temporary output folder
        Path outPath = rootPath.resolve(UUID.randomUUID().toString());
        try {
            // extract tar.gz to output folder
            PathUtils.unTarGz(is, outPath);
            // load config
            return updateProcess0(outPath);
        } finally {
            PathUtils.silentDelete(outPath);
        }
    }

    public boolean checkNoDuplicateProcessInUploadedFile(ProcessGroups newProcessGroups) {
        HashMap<String, Integer> mapOfProcesses = new HashMap<>();

        for (ProcessGroup group : newProcessGroups.groups()) {
            for (String process : group.processes()) {
                if (mapOfProcesses.containsKey(process))
                    return false;
                else
                    mapOfProcesses.put(process, 1);
            }
        }
        return true;
    }

    /**
     * Updates or creates processgroups file from a file uploaded from POST
     * /businessconfig/processgroups
     *
     * @param fileContent processgroups file input stream
     * @throws IOException if error arises during stream reading
     */
    public synchronized void updateProcessGroupsFile(String fileContent) throws IOException {
        Path rootPath = Paths
                .get(this.storagePath)
                .normalize();
        if (!rootPath.toFile().exists())
            throw new FileNotFoundException("No directory available to copy processgroups file");

        ProcessGroups newProcessGroups = objectMapper.readValue(fileContent, ProcessGroups.class);

        if (!checkNoDuplicateProcessInUploadedFile(newProcessGroups))
            throw new ApiErrorException(
                    new ApiError(HttpStatus.BAD_REQUEST, DUPLICATE_PROCESS_IN_PROCESS_GROUPS_FILE));

        // copy file
        PathUtils.copyInputStreamToFile(new ByteArrayInputStream(fileContent.getBytes()),
                rootPath.toString() + "/processGroups.json");

        // update cache
        processGroupsCache = newProcessGroups;
        pushProcessChangeInEventBus();
    }

    /**
     * Updates or creates uimenu file from a file uploaded from POST
     * /businessconfig/uimenu
     *
     * @param fileContent uimenu file input stream
     * @throws IOException if error arises during stream reading
     */
    public synchronized void updateUIMenuFile(String fileContent) throws IOException {
        Path rootPath = Paths.get(this.storagePath).normalize();
        if (!rootPath.toFile().exists()) {
            throw new FileNotFoundException("No directory available to copy uimenu file");
        }

        UIMenu newUIMenu = objectMapper.readValue(fileContent, UIMenu.class);

        // copy file
        PathUtils.copyInputStreamToFile(new ByteArrayInputStream(fileContent.getBytes(StandardCharsets.UTF_8)),
                rootPath.toString() + "/uimenu.json");

        this.uiMenuCache = newUIMenu;

        eventBus.sendEvent(PROCESS_EVENT_KEY, "UIMENU_CONFIG_CHANGE");
    }

    /**
     * Updates or creates process from disk saved bundle
     *
     * @param outPath path to the bundle
     * @return the new or updated process data
     * @throws IOException multiple underlying case (Json read, file system access,
     *                     file system manipulation - copy,
     *                     move)
     */
    private Process updateProcess0(Path outPath) throws IOException {
        // load Process from config
        Path outConfigPath = outPath.resolve(CONFIG_FILE_NAME);
        Process process = objectMapper.readValue(outConfigPath.toFile(), Process.class);

        this.checkInputDoesNotContainForbiddenCharacters("id of the process", process.id());
        this.checkInputDoesNotContainForbiddenCharacters("version", process.version());

        // process root
        Path existingRootPath = Paths.get(this.storagePath + BUNDLE_FOLDER)
                .resolve(process.id())
                .normalize();
        // process default config
        Path existingConfigPath = existingRootPath.resolve(CONFIG_FILE_NAME);
        // process versioned root
        Path existingVersionPath = existingRootPath.resolve(process.version());
        // move versioned dir
        PathUtils.silentDelete(existingVersionPath);
        PathUtils.moveDir(outPath, existingVersionPath);
        // copy config file to default
        PathUtils.silentDelete(existingConfigPath);
        PathUtils.copy(existingVersionPath.resolve(CONFIG_FILE_NAME), existingConfigPath);

        // update caches
        currentProcessesCache.put(process.id(), process);
        allProcessVersionsCache.put(process.id(), process.version(), process);

        pushProcessChangeInEventBus();

        // retrieve newly loaded process from cache
        return fetch(process.id(), process.version());
    }

    /**
     * Fetches {@link Process} for specified id and version
     *
     * @param id      process id
     * @param version {@link Process} version, if null falls back to default version
     *                (latest upload)
     * @return fetch {@link Process} or null if it does not exist
     */
    public Process fetch(String id, String version) {
        if (version == null)
            return this.currentProcessesCache.get(id);
        if (this.allProcessVersionsCache.contains(id, version))
            return this.allProcessVersionsCache.get(id, version);
        else
            return null;
    }

    /**
     * Deletes {@link Process} for specified id
     * 
     * @param id process id
     * @throws IOException
     */
    public synchronized void delete(String id) throws IOException {

        // this condition avoids path traversal security issues
        if (!currentProcessesCache.containsKey(id)) {
            throw new FileNotFoundException("Unable to find a bundle with the given id");
        }
        // process root
        Path processRootPath = Paths.get(this.storagePath + BUNDLE_FOLDER)
                .resolve(id)
                .normalize();
        // delete process root from disk
        PathUtils.delete(processRootPath);
        log.debug("removed process:{} from filesystem", id);
        removeFromCache(id);
        pushProcessChangeInEventBus();
    }

    /**
     * Deletes {@link Process} for specified id and version
     * 
     * @param id      process id
     * @param version process version
     * @throws IOException
     */
    public synchronized void deleteVersion(String id, String version) throws IOException {

        // this condition avoids path traversal security issues
        if (!allProcessVersionsCache.contains(id, version)) {
            throw new FileNotFoundException("Unable to find a bundle with the given id and version");
        }
        Process process = currentProcessesCache.get(id);
        Path processRootPath = Paths.get(this.storagePath + BUNDLE_FOLDER)
                .resolve(id)
                .normalize();
        /*
         * case: bundle has only one version(this control is put here to skip if it's
         * possible
         * heavy operations like file system access)
         */
        if ((process.version().equals(version)) &&
                allProcessVersionsCache.row(id).size() == 1) {
            // delete the whole bundle
            // delete process root from disk
            PathUtils.delete(processRootPath);
            log.debug("removed process:{} from filesystem", id);
            removeFromCache(id);
        } else {// case: multiple versions => to delete only the given version
            Path processVersionPath = processRootPath.resolve(version);
            if (process.version().equals(version)) {// case: version to delete is the default one => root config
                                                    // replacement
                // replace default
                // choose the most recent through filesystem walk
                try (Stream<Path> files = Files.list(processRootPath)
                        .filter(p -> !p.equals(processVersionPath) && Files.isDirectory(p)
                                && allProcessVersionsCache.contains(id, p.getFileName().toString()))) {
                    Optional<Path> versionBecomingNewDefault = files
                            .max(this::comparePathsByModifiedTimeManagingException);
                    if (versionBecomingNewDefault.isPresent()) {
                        Path versionBecomingNewDefaultPath = versionBecomingNewDefault.get();
                        Files.copy(versionBecomingNewDefaultPath.resolve(CONFIG_FILE_NAME),
                                processRootPath.resolve(CONFIG_FILE_NAME), StandardCopyOption.REPLACE_EXISTING);
                        Process defaultProcess = allProcessVersionsCache.get(id,
                                versionBecomingNewDefaultPath.getFileName().toString());
                        currentProcessesCache.put(id, defaultProcess);
                    } else {
                        throw new IOException("Inconsistent file system state");
                    }
                } catch (UncheckedIOException e) {
                    throw e.getCause();
                }
            }
            // delete version folder
            PathUtils.delete(processVersionPath);
            log.debug("removed process:{} with version:{} from filesystem", id, version);
            allProcessVersionsCache.remove(id, version);
            pushProcessChangeInEventBus();
        }
    }

    /**
     * Removes all configuration bundles from storage and clears all caches
     *
     * @throws IOException multiple underlying cases (file system access, file
     *                     system manipulation - deletion)
     */
    public void clear() throws IOException {
        Resource resource = this.resourceLoader.getResource(PATH_PREFIX + this.storagePath + BUNDLE_FOLDER);
        File file = resource.getFile();
        if (file.exists()) {
            Path storageRoot = PathUtils.getPath(file);
            try (Stream<Path> pathStream = Files.walk(storageRoot, 1)) {
                pathStream
                        .filter(path -> path != storageRoot) // Avoid deleting the storage root folder
                        .forEach(PathUtils::silentDelete);
            } finally {
                this.allProcessVersionsCache.clear();
                this.currentProcessesCache.clear();
                this.processGroupsCache = new ProcessGroups(new ArrayList<>());
            }
        } else {
            this.allProcessVersionsCache.clear();
            this.currentProcessesCache.clear();
            this.processGroupsCache = new ProcessGroups(new ArrayList<>());
        }
        pushProcessChangeInEventBus();
    }

    /**
     * Remove process from caches
     * 
     * @param id process id
     */
    private void removeFromCache(String id) {
        Object removed = currentProcessesCache.remove(id);
        if (removed != null) {
            log.debug("removed process:{} from currentProcessesCache", id);
        }
        allProcessVersionsCache.row(id).clear();
        log.debug("removed process:{} from allProcessVersionsCache", id);
    }

    private int comparePathsByModifiedTimeManagingException(Path p1, Path p2) {
        try {
            return Files.getLastModifiedTime(p1).compareTo(Files.getLastModifiedTime(p2));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    /**
     * 
     * @param process
     * @return an optional holding the error if any, as a text message. A value of
     *         null means no errors
     */
    private Optional<String> getConfigFileValidationErrors(Process process) {
        Set<ConstraintViolation<Process>> errors = validator.validate(process);
        String resultMessage = null;
        if (!errors.isEmpty()) {
            Optional<String> error = errors.stream()
                    .map(e -> String.format("the property '%s' %s", e.getPropertyPath(), e.getMessage()))
                    .reduce((p, e) -> p.isEmpty() ? e : p + "|" + e);
            resultMessage = error.orElse("unexpected format error");
        }
        return Optional.ofNullable(resultMessage);
    }

    private void pushProcessChangeInEventBus() {
        eventBus.sendEvent(PROCESS_EVENT_KEY, "BUSINESS_CONFIG_CHANGE");
    }

    /**
     * Updates or creates realtimescreens file from a file uploaded from POST
     * /businessconfig/realtimescreens
     *
     * @param fileContent realtimescreens file input stream
     * @throws IOException if error arises during stream reading
     */
    public synchronized void updateRealTimeScreensFile(String fileContent) throws IOException {
        Path rootPath = Paths
                .get(this.storagePath)
                .normalize();
        if (!rootPath.toFile().exists())
            throw new FileNotFoundException("No directory available to copy realtimescreens file");

        RealTimeScreens newRealTimeScreens = objectMapper.readValue(fileContent, RealTimeScreens.class);

        // copy file
        PathUtils.copyInputStreamToFile(new ByteArrayInputStream(fileContent.getBytes()),
                rootPath.toString() + "/realtimescreens.json");

        // update cache
        realTimeScreensCache = newRealTimeScreens;
    }

    public RealTimeScreens getRealTimeScreensCache() {
        return realTimeScreensCache;
    }

    /**
     * Deletes {@link Process} for specified id
     * 
     * @param resourceName process id
     * @throws IOException
     */
    public synchronized void deleteFile(String resourceName) throws IOException {
        resourceName = StringUtils.sanitize(resourceName);
        Path resourcePath = Paths.get(this.storagePath + BUSINESS_DATA_FOLDER)
                .resolve(resourceName)
                .normalize();
        if (!resourcePath.toFile().exists()) {
            throw new FileNotFoundException("Unable to find the resource " + resourceName);
        }
        // delete resource from disk
        PathUtils.delete(resourcePath);
        log.debug("removed resource:{} from filesystem", resourceName);
    }

    private void isResourceJSON(String fileContent) throws ParseException {
        new JSONParser(JSONParser.MODE_RFC4627).parse(fileContent);
    }

    /**
     * Updates or creates businessdata file from a file uploaded from POST
     * /businessconfig/businessdata
     *
     * @param is businessdata file input stream
     * @throws IOException if error arises during stream reading
     */
    public synchronized void updateBusinessDataFile(String fileContent, String resourceName)
            throws IOException, ParseException {

        resourceName = StringUtils.sanitize(resourceName);
        Path businessDataPath = Paths.get(this.storagePath + "/businessdata").normalize();

        if (!businessDataPath.toFile().exists()) {
            Files.createDirectories(businessDataPath);
        }

        this.isResourceJSON(fileContent);

        // copy file
        PathUtils.copyInputStreamToFile(new ByteArrayInputStream(fileContent.getBytes()),
                businessDataPath.toString() + "/" + resourceName);

        eventBus.sendEvent(PROCESS_EVENT_KEY, "BUSINESS_DATA_CHANGE");

    }

    public void updateProcessMonitoringFile(String fileContent)
            throws IOException, ParseException {

        Path rootPath = Paths
                .get(this.storagePath)
                .normalize();
        if (!rootPath.toFile().exists())
            throw new FileNotFoundException("No directory available to copy processmonitoring file");

        this.isResourceJSON(fileContent);

        ProcessMonitoring processMonitoring = objectMapper.readValue(fileContent, ProcessMonitoring.class);

        PathUtils.copyInputStreamToFile(new ByteArrayInputStream(fileContent.getBytes(StandardCharsets.UTF_8)),
                rootPath.toString() + "/processmonitoring.json");

        processMonitoringCache = processMonitoring;
        this.eventBus.sendEvent(PROCESS_EVENT_KEY, "PROCESSMONITORING_CONFIG_CHANGE");
    }

    public ProcessMonitoring getProcessMonitoring() {
        return this.processMonitoringCache;
    }

    public Resource getBusinessData(String resourceName) throws FileNotFoundException {
        this.checkInputDoesNotContainForbiddenCharacters("business data file name", resourceName);
        Path resourcePath = Paths.get(this.storagePath + BUSINESS_DATA_FOLDER)
                .resolve(resourceName)
                .normalize();
        if (!resourcePath.toFile().exists()) {
            throw new FileNotFoundException("Unable to find the resource " + resourceName);
        }
        return this.resourceLoader.getResource(PATH_PREFIX + resourcePath.toString());
    }

    public String getAllBusinessData() throws IOException {
        Path resourcePath = Paths.get(this.storagePath + BUSINESS_DATA_FOLDER).normalize();
        Set<String> fileSet = new HashSet<>();
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(resourcePath)) {
            for (Path path : stream) {
                if (!Files.isDirectory(path)) {
                    fileSet.add(path.getFileName()
                            .toString());
                }
            }
        }
        return this.objectMapper.writeValueAsString(fileSet);
    }

    public void deleteAllBusinessData() throws IOException {
        Path resourcePath = Paths.get(this.storagePath + BUSINESS_DATA_FOLDER).normalize();
        File dataDirectory = new File(resourcePath.toString());
        FileUtils.cleanDirectory(dataDirectory);
    }

    public Resource getBundleZip(String processId, String version) throws IOException {

        if (!allProcessVersionsCache.contains(processId, version)) {
            throw new FileNotFoundException(
                    "Unable to find bundle " + processId + " version " + version);
        }

        Path bundlePath = Paths.get(this.storagePath + BUNDLE_FOLDER)
                .resolve(processId)
                .resolve(version)
                .normalize();
        // Suppressing Sonar rule java:S5443 (Temporary files should not be created in
        // publicly writable directories)
        // No risks identified here
        Path tempZip = Files.createTempFile(processId + "-" + version, ".zip"); // NOSONAR
        try {
            try (ZipOutputStream zs = new ZipOutputStream(Files.newOutputStream(tempZip));
                    Stream<Path> paths = Files.walk(bundlePath)) {
                Iterator<Path> iterator = paths.filter(path -> !Files.isDirectory(path)).iterator();
                while (iterator.hasNext()) {
                    Path path = iterator.next();
                    ZipEntry zipEntry = new ZipEntry(bundlePath.relativize(path).toString());
                    zs.putNextEntry(zipEntry);
                    Files.copy(path, zs);
                    zs.closeEntry();
                }
            }

            return new InputStreamResource(Files.newInputStream(tempZip)) {
                @Override
                public long contentLength() throws IOException {
                    return Files.size(tempZip);
                }

                @Override
                public String getFilename() {
                    return tempZip.getFileName().toString();
                }

                @Override
                public InputStream getInputStream() throws IOException {
                    return new FilterInputStream(super.getInputStream()) {
                        @Override
                        public void close() throws IOException {
                            try {
                                super.close();
                            } finally {
                                Files.deleteIfExists(tempZip);
                            }
                        }
                    };
                }
            };
        } catch (IOException | RuntimeException e) {
            Files.deleteIfExists(tempZip);
            throw e;
        }
    }

    private void checkInputDoesNotContainForbiddenCharacters(String inputName, String inputValue)
            throws ApiErrorException {
        if (inputValue.contains("#") || inputValue.contains("?") ||
                inputValue.contains("/") || inputValue.contains("\\")) {
            throw new ApiErrorException(
                    new ApiError(HttpStatus.BAD_REQUEST,
                            "The " + inputName + " should not contain characters #, ?, /, \\"));
        }
    }
}
