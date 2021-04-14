/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.businessconfig.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.HashBasedTable;
import com.google.common.collect.Table;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.businessconfig.model.Process;
import org.lfenergy.operatorfabric.businessconfig.model.*;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.lfenergy.operatorfabric.utilities.PathUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ResourceLoaderAware;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import javax.annotation.PostConstruct;
import javax.validation.ConstraintViolation;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.function.BiConsumer;
import java.util.function.Function;
import java.util.stream.Stream;

/**
 * Processes Service for managing business processes definition and resources
 *
 */
@Service
@Slf4j
public class ProcessesService implements ResourceLoaderAware {

	private static final String PATH_PREFIX = "file:";
    private static final String CONFIG_FILE_NAME = "config.json";
    private static final String DUPLICATE_PROCESS_IN_PROCESS_GROUPS_FILE = "There is a duplicate process in the file you have sent";

    @Value("${operatorfabric.businessconfig.storage.path}")
    private String storagePath;
    private ObjectMapper objectMapper;
    private Map<String, Process> defaultCache;
    private Table<String,String, Process> completeCache;
    private ResourceLoader resourceLoader;
    private LocalValidatorFactoryBean validator;
    private ProcessGroupsData processGroupsCache;
    
    @Autowired
    public ProcessesService(ObjectMapper objectMapper, LocalValidatorFactoryBean validator) {
        this.objectMapper = objectMapper;
        this.completeCache = HashBasedTable.create();
        this.defaultCache = new HashMap<>();
        this.validator = validator;
    }
    
    @PostConstruct
    private void init() {
    	loadCache();
    	loadProcessGroupsCache();
    }

    public ProcessGroups getProcessGroupsCache() {
        return processGroupsCache;
    }

    /**
     * Lists all registered processes
     *
     * @return registered processes
     */
	public List<Process> listProcesses() {
		return new ArrayList<>(defaultCache.values());		
	}

    /**
     * Loads processGroups data to processGroupsCache
     */
    public void loadProcessGroupsCache() {

        this.processGroupsCache = new ProcessGroupsData(new ArrayList<>(), new ProcessGroupsLocaleData());
        try {
            Path rootPath = Paths
                    .get(this.resourceLoader.getResource(PATH_PREFIX + this.storagePath).getFile().getAbsolutePath())
                    .normalize();

            File f = new File(rootPath.toString() + "/processGroups.json");
            if (f.exists() && f.isFile()) {
                log.info("loading processGroups.json file from {}", new File(storagePath).getAbsolutePath());
                this.processGroupsCache = objectMapper.readValue(f, ProcessGroupsData.class);
            }
        }
        catch (IOException e) {
            log.warn("Unreadable processGroups.json file at  {}", storagePath);
        }
    }

    /**
     * Loads process data to defaultCache (not thread safe)
     */
    public void loadCache() {
        log.info("loading processes from {}", new File(storagePath).getAbsolutePath());
        try {
            Map<String, Map<String, Process>> completeResult = new HashMap<>();
            Resource root = this.resourceLoader.getResource(PATH_PREFIX + storagePath);
            //load default Processes and recursively loads versioned Processes
            Map<String, Process> result = loadCache0(root.getFile(),
                    Process::getId,
                    (f, p) -> completeResult.put(
                            p.getId(),
                            loadCache0(f, Process::getVersion, null)
                    )
            );
			this.completeCache.clear();			
            this.defaultCache.clear();
            this.defaultCache.putAll(result);
			completeResult.keySet()
                    .forEach(k1 -> completeResult.get(k1).keySet()
					.forEach(k2 -> completeCache.put(k1, k2, completeResult.get(k1).get(k2))));            
        } catch (IOException e) {
            log.warn("Unreadable Process config files at  {}", storagePath);
        }

    }

    /**
     * Loads a cache for Process resource bundle. Loops over a folder sub folders (depth 1) to find config.json files.
     * These files contain Json serialized {@link ProcessData} objects.
     *
     * @param root         lookup folder
     * @param keyExtractor key cache extractor from loaded {@link ProcessData}
     * @param onEachActor  do something on each subfolder. Optional.
     * @return loaded cache
     */
    private Map<String, Process> loadCache0(File root,
                                          Function<Process, String> keyExtractor,
                                          BiConsumer<File, Process> onEachActor) {
        Map<String, Process> result = new HashMap<>();
        if (root.listFiles() != null)
            Arrays.stream(root.listFiles())
                    .filter(File::isDirectory)
                    .forEach(f -> {
                                File[] configFile = f.listFiles((sf, name) -> name.equals(CONFIG_FILE_NAME));
                                if (configFile.length >= 1) {
                                    try {
                                        ProcessData process = objectMapper.readValue(configFile[0], ProcessData.class);
                                        Optional<String> validationError = getConfigFileValidationErrors(process);
                                        if (validationError.isPresent()) {
                                        	log.warn("Unreadable process config file({}) because these validation errors: {}", f.getAbsolutePath(), validationError.get());
                                        	return;
                                        }
                                        result.put(keyExtractor.apply(process), process);
                                        if (onEachActor != null)
                                            onEachActor.accept(f, process);
                                    } catch (IOException e) {
                                        log.warn("Unreadable process config file "+ f.getAbsolutePath(), e);
                                    }
                                }
                            }
                    );
        return result;
    }

    /**
     * Computes resource handle
     *
     * @param process Process 
     * @param type      resource type
     * @param name      resource name
     * @return resource handle
     * @throws FileNotFoundException if corresponding file does not exist
     */
    public Resource fetchResource(String process, ResourceTypeEnum type, String name) throws
            FileNotFoundException {
        return fetchResource(process, type, null, null, name);
    }

    /**
     * Computes resource handle
     *
     * @param processId Process id
     * @param type      resource type
     * @param version   process configuration version
     * @param locale    chosen locale use default if not set
     * @param name      resource name
     * @return resource handle
     * @throws FileNotFoundException if corresponding file does not exist
     */
    public Resource fetchResource(String processId, ResourceTypeEnum type, String version, String locale,
                                  String name) throws FileNotFoundException {
        Map<String, Process> versions = completeCache.row(processId);
        if (versions.isEmpty())
            throw new FileNotFoundException("No resource exist for " + processId);

        Process process;
        String finalVersion = version;

        if ((version == null) || (version.length() == 0)){
            finalVersion = this.fetch(processId).getVersion();
        }

        process = versions.get(finalVersion);

        if (process == null)
            throw new FileNotFoundException("Unknown version (" + finalVersion + ") for " + processId);

        if (type.isLocalized() && locale == null)
            throw new FileNotFoundException("Unable to determine resource for undefined locale");

        String finalName = (type == ResourceTypeEnum.I18N) ? locale : name;

        String resourcePath = PATH_PREFIX +
                storagePath +
                File.separator +
                processId +
                File.separator +
                finalVersion +
                File.separator +
                type.getFolder() +
                File.separator +
                (type.isLocalized() && !type.equals(ResourceTypeEnum.I18N) ? (locale + File.separator) : "") +
                finalName + type.getSuffix();

        log.info("loading resource: {}", resourcePath);
        Resource resource = this.resourceLoader.getResource(resourcePath);
        if (!resource.exists()) {
            throw new FileNotFoundException("Unknown " + type + " resource for " + processId + ":" + version);
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

    /**
     * Computes resource handle
     *
     * @param process Process id
     * @param type      resource type
     * @param version   process configuration version
     * @param name      resource name
     * @return resource handle
     * @throws FileNotFoundException if corresponding resource does not exist
     */
    public Resource fetchResource(String process, ResourceTypeEnum type, String version, String name) throws
            FileNotFoundException {
        return fetchResource(process, type, version, null, name);
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
     * @throws IOException if error arise during stream reading
     */
    public synchronized Process updateProcess(InputStream is) throws IOException {
    	Path rootPath = Paths
				.get(this.resourceLoader.getResource(PATH_PREFIX + this.storagePath).getFile().getAbsolutePath())
				.normalize();
		if (!rootPath.toFile().exists())
			throw new FileNotFoundException("No directory available to unzip bundle");
		// create a temporary output folder
		Path outPath = rootPath.resolve(UUID.randomUUID().toString());
		try {
			//extract tar.gz to output folder
			PathUtils.unTarGz(is, outPath);
			//load config
			return updateProcess0(outPath);
		} finally {
			PathUtils.silentDelete(outPath);
		}
    }

    public boolean checkNoDuplicateProcessInUploadedFile(ProcessGroupsData newProcessGroups) {
        HashMap<String, Integer> mapOfProcesses = new HashMap<>();

        for (ProcessGroup group : newProcessGroups.getGroups()) {
            for (String process : group.getProcesses()) {
                if (mapOfProcesses.containsKey(process))
                    return false;
                else
                    mapOfProcesses.put(process, 1);
            }
        }
        return true;
    }

    /**
     * Updates or creates processgroups file from a file uploaded from POST /businessconfig/processgroups
     *
     * @param is processgroups file input stream
     * @throws IOException if error arise during stream reading
     */
    public synchronized void updateProcessGroupsFile(InputStream is) throws IOException {
        Path rootPath = Paths
                .get(this.resourceLoader.getResource(PATH_PREFIX + this.storagePath).getFile().getAbsolutePath())
                .normalize();
        if (!rootPath.toFile().exists())
            throw new FileNotFoundException("No directory available to copy processgroups file");

        ProcessGroupsData newProcessGroups = objectMapper.readValue(is, ProcessGroupsData.class);
        is.reset();

        if (! checkNoDuplicateProcessInUploadedFile(newProcessGroups))
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message(DUPLICATE_PROCESS_IN_PROCESS_GROUPS_FILE)
                            .build());

        //copy file
        PathUtils.copyInputStreamToFile(is, rootPath.toString() + "/processGroups.json");

        //update cache
        processGroupsCache = newProcessGroups;
    }

    /**
     * Updates or creates process from disk saved bundle
     *
     * @param outPath path to the bundle
     * @return the new or updated process data
     * @throws IOException multiple underlying case (Json read, file system access, file system manipulation - copy,
     *                     move)
     */
    private Process updateProcess0(Path outPath) throws IOException {
        // load Process from config
        Path outConfigPath = outPath.resolve(CONFIG_FILE_NAME);
        ProcessData process = objectMapper.readValue(outConfigPath.toFile(), ProcessData.class);
        //process root
        Path existingRootPath = Paths.get(this.resourceLoader.getResource(PATH_PREFIX + this.storagePath).getFile()
                .getAbsolutePath())
                .resolve(process.getId())
                .normalize();
        //process default config
        Path existingConfigPath = existingRootPath.resolve(CONFIG_FILE_NAME);
        //process versioned root
        Path existingVersionPath = existingRootPath.resolve(process.getVersion());
        //move versioned dir
        PathUtils.silentDelete(existingVersionPath);
        PathUtils.moveDir(outPath, existingVersionPath);
        //copy config file to default
        PathUtils.silentDelete(existingConfigPath);
        PathUtils.copy(existingVersionPath.resolve(CONFIG_FILE_NAME), existingConfigPath);

        //update caches
        defaultCache.put(process.getId(),process);
        completeCache.put(process.getId(), process.getVersion(), process);
        //retieve newly loaded process from cache
        return fetch(process.getId(), process.getVersion());
    }

    /**
     * Fetches {@link Process} for specified id and version
     *
     * @param id process id
     * @param version {@link Process} version, if null falls back to default version (latest upload)
     * @return fetch {@link Process} or null if it does not exist
     */
    public Process fetch(String id, String version) {
        if (version == null)
            return this.defaultCache.get(id);
        if (this.completeCache.contains(id,version))
            return this.completeCache.get(id,version);
        else return null;        
    }
    
    /**
     * Deletes {@link Process} for specified id
     * @param id process id
     * @throws IOException 
     */
    public synchronized void delete(String id) throws IOException {
		if (!defaultCache.containsKey(id)) {
    		throw new FileNotFoundException("Unable to find a bundle with the given id");
    	}
    	//process root
    	Path processRootPath = Paths.get(this.resourceLoader.getResource(PATH_PREFIX + this.storagePath).getFile()
                .getAbsolutePath())
                .resolve(id)
                .normalize();
    	//delete process root from disk
    	PathUtils.delete(processRootPath);
    	log.debug("removed process:{} from filesystem", id);
    	removeFromCache(id);
    }
    
    /**
     * Deletes {@link Process} for specified id and version
     * @param id       process id
     * @param version    process version
     * @throws IOException 
     */
	public synchronized void deleteVersion(String id, String version) throws IOException {
		if (!completeCache.contains(id,version)) {
			throw new FileNotFoundException("Unable to find a bundle with the given id and version");
		}
		Process process = defaultCache.get(id);
		Path processRootPath = Paths.get(this.resourceLoader.getResource(PATH_PREFIX + this.storagePath).getFile()
                .getAbsolutePath())
                .resolve(id)
                .normalize();
		/* case: bundle has only one version(this control is put here to skip if it's possible
		 * heavy operations like file system access)
		 */
		if ((process.getVersion().equals(version)) &&
				completeCache.row(id).size() == 1) {
			//delete the whole bundle				
	    	//delete process root from disk
			PathUtils.delete(processRootPath);
			log.debug("removed process:{} from filesystem", id);
			removeFromCache(id);
		} else {//case: multiple versions => to delete only the given version
			Path processVersionPath = processRootPath.resolve(version);
			if (process.getVersion().equals(version)) {//case: version to delete is the default one => root config replacement
				//replace default
				//choose the most recent through filesystem walk				
				try (Stream<Path> files = Files.list(processRootPath)
						.filter(p -> !p.equals(processVersionPath) && Files.isDirectory(p)
						&& completeCache.contains(id, p.getFileName().toString()))) {
					Optional<Path> versionBecomingNewDefault = files
							.max(this::comparePathsByModifiedTimeManagingException);
					if (versionBecomingNewDefault.isPresent()) {
						Path versionBecomingNewDefaultPath = versionBecomingNewDefault.get();
						Files.copy(versionBecomingNewDefaultPath.resolve(CONFIG_FILE_NAME),
								processRootPath.resolve(CONFIG_FILE_NAME), StandardCopyOption.REPLACE_EXISTING);
						Process defaultProcess = completeCache.get(id,
								versionBecomingNewDefaultPath.getFileName().toString());
						defaultCache.put(id, defaultProcess);
					} else {
						throw new IOException("Inconsistent file system state");
					} 
				} catch(UncheckedIOException e) {
					throw e.getCause();
				}				
			}
			//delete version folder
			PathUtils.delete(processVersionPath);
			log.debug("removed process:{} with version:{} from filesystem", id, version);
			completeCache.remove(id,version);
		}
	}

    /**
     * Removes all configuration bundles from storage and clears all caches
     *
     * @throws IOException multiple underlying cases (file system access, file system manipulation - deletion)
     */
    public void clear() throws IOException {    	
        Resource resource = this.resourceLoader.getResource(PATH_PREFIX + this.storagePath);
        File file = resource.getFile();
        if(file.exists()) {
            Path storageRoot = PathUtils.getPath(file);
            try (Stream<Path> pathStream = Files.walk(storageRoot, 1)) {
                pathStream
                        .filter(path -> path != storageRoot) // Avoid deleting the storage root folder
                        .forEach(PathUtils::silentDelete);
            }finally {
                this.completeCache.clear();
                this.defaultCache.clear();
                this.processGroupsCache.clear();
            }
        }else{
            this.completeCache.clear();
            this.defaultCache.clear();
            this.processGroupsCache.clear();
        }
    }
        
    /**
     * Remove process from caches
     * @param id       process id
     */
    private void removeFromCache(String id) {
    	Object removed = defaultCache.remove(id);
    	if (removed!=null) {
    		log.debug("removed process:{} from defaultCache", id);
    	}    	
    	completeCache.row(id).clear();
    	log.debug("removed process:{} from completeCache", id);
    }
    
    private int comparePathsByModifiedTimeManagingException(Path p1,Path p2) {
    	try {
			return Files.getLastModifiedTime(p1).compareTo(Files.getLastModifiedTime(p2));
		} catch (IOException e) {
			throw new UncheckedIOException(e);
		}
    }
    
    /**
     * 
     * @param process
     * @return an optional holding the error if any, as a text message. A value of null means no errors 
     */
    private Optional<String> getConfigFileValidationErrors(Process process){    	
    	Set<ConstraintViolation<Process>> errors = validator.validate(process);
    	String resultMessage = null;
        if (!errors.isEmpty()) {
        	Optional<String> error = errors.stream().map(e -> String.format("the property '%s' %s", e.getPropertyPath(),e.getMessage()))
        			.reduce((p,e) -> p.isEmpty()? e : p+"|"+e);
        	resultMessage = error.orElse("unexpected format error");
        }
    	return Optional.ofNullable(resultMessage);
    }

}
