/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import OperationResult from './operationResult';
import fs, {createReadStream, rm} from 'fs';
import tar from 'tar';
import {v4 as uuidv4} from 'uuid';
import {ResourceType} from './resourceType';
import path from 'path';
import {JsonValidator, processSchema} from './configFileValidator';

export default class BundleStorage {
    private storagePath: string;
    private lastProcessConfig = new Map<string, any>();
    private allProcessConfig = new Map<string, Map<string, any>>();
    private jsonValidator = new JsonValidator();

    constructor(storagePath: string) {
        this.storagePath = storagePath;
        if (!fs.existsSync(this.storagePath + '/bundles')) {
            try {
                fs.mkdirSync(this.storagePath + '/bundles');
            } catch (error) {
                console.log(new Date().toISOString(), error);
            }
        }
        if (!fs.existsSync(this.storagePath + '/tmp')) {
            fs.mkdirSync(this.storagePath + '/tmp');
        }
        this.loadBundlesFromDisk();
    }

    private loadBundlesFromDisk() {
        const processDirectories = fs.readdirSync(this.storagePath + '/bundles');
        for (const processDirectory of processDirectories) {
            const processVersions = fs.readdirSync(this.storagePath + '/bundles/' + processDirectory);
            for (const processVersion of processVersions) {
                if (processVersion === 'config.json') {
                    const config = fs.readFileSync(this.storagePath + '/bundles/' + processDirectory + '/config.json');
                    const configObject = JSON.parse(config.toString());
                    this.lastProcessConfig.set(configObject.id, configObject);
                } else {
                    const config = fs.readFileSync(
                        this.storagePath + '/bundles/' + processDirectory + '/' + processVersion + '/config.json'
                    );
                    const configObject = JSON.parse(config.toString());
                    if (!this.allProcessConfig.has(configObject.id)) {
                        this.allProcessConfig.set(configObject.id, new Map<string, any>());
                    }
                    this.allProcessConfig.get(configObject.id)?.set(configObject.version, configObject);
                }
            }
        }
    }

    async saveBundle(bundleTarGzFile: any): Promise<OperationResult<void>> {
        const randomBundleFileName = uuidv4();
        const filePath = `${this.storagePath}/tmp/${randomBundleFileName}.tar.gz`;
        const tempDirPath = `${this.storagePath}/tmp/${randomBundleFileName}`;

        try {
            fs.writeFileSync(filePath, bundleTarGzFile);
        } catch (error) {
            console.log(error);
            return OperationResult.error(new Error('Cannot write file' + error));
        }

        try {
            if (!fs.existsSync(tempDirPath)) {
                fs.mkdirSync(tempDirPath);
            }
            await this.gunzipAndUntar(filePath, tempDirPath);
            fs.rmSync(filePath, {force: true});
        } catch (error) {
            console.log(error);
            return OperationResult.error(new Error('Cannot gunzip and untar file' + error));
        }
        let config;
        try {
            config = fs.readFileSync(`${tempDirPath}/config.json`);
        } catch (error) {
            console.log(new Date().toISOString(), error);
            return OperationResult.error(new Error('Cannot read file' + error));
        }
        const {valid,json,errors} = this.jsonValidator.validateJSON(JSON.parse(config.toString()),processSchema);
        if (!valid) {
            return OperationResult.error(new Error('Invalid config file: ' + errors));
        }
        else {
            config = json;
            fs.writeFileSync(`${tempDirPath}/config.json`, JSON.stringify(config));
        }
        this.moveBundleInFinalDirectory(tempDirPath);
        this.lastProcessConfig.set(config.id, config);
        if (!this.allProcessConfig.has(config.id)) {
            this.allProcessConfig.set(config.id, new Map<string, any>());
        }
        this.allProcessConfig.get(config.id)?.set(config.version, config);

        return OperationResult.success(undefined);
    }

    private async gunzipAndUntar(filePath: string, outputDir: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const readStream = createReadStream(filePath);
            const extract = tar.x({C: outputDir});

            readStream.pipe(extract).on('error', reject).on('finish', resolve);
        });
    }

    private moveBundleInFinalDirectory(bundlePath: string) {
        const config = fs.readFileSync(bundlePath + '/config.json');
        const configAsString = config.toString();
        const configAsJSON = JSON.parse(configAsString);
        const processId = configAsJSON.id;
        const version = configAsJSON.version;
        if (!fs.existsSync(`${this.storagePath}/bundles/${processId}`)) {
            fs.mkdirSync(`${this.storagePath}/bundles/${processId}`);
        }
        if (fs.existsSync(`${this.storagePath}/bundles/${processId}/${version}`)) {
            fs.rmSync(`${this.storagePath}/bundles/${processId}/${version}`, {recursive: true, force: true});
        }
        fs.renameSync(bundlePath, `${this.storagePath}/bundles/${processId}/${version}`);
        const currentDate = new Date(); // need to set the date to keep track of the order of saving, it is used to get the last version
        fs.utimesSync(
            `${this.storagePath}/bundles/${processId}/${version}/config.json`,
            currentDate,
            currentDate
        );
        fs.copyFileSync(
            `${this.storagePath}/bundles/${processId}/${version}/config.json`,
            `${this.storagePath}/bundles/${processId}/config.json`
        );
    }

    public fetchResource(
        resourceType: ResourceType,
        processId: string,
        version: string | undefined,
        resourceName?: string
    ): OperationResult<any> {
        let resourcePath = '';
        switch (resourceType) {
            case ResourceType.CSS:
                resourcePath = `${this.storagePath}/bundles/${processId}/${version}/css/${resourceName}.css`;
                break;
            case ResourceType.TEMPLATE:
                resourcePath = `${this.storagePath}/bundles/${processId}/${version}/template/${resourceName}.handlebars`;
                break;
            case ResourceType.I18N:
                resourcePath = `${this.storagePath}/bundles/${processId}/${version}/i18n.json`;
                break;
            case ResourceType.CONFIG:
                if (!processId) {
                    if (version == 'all') return new OperationResult(this.getAllProcessConfig(), undefined);
                    return new OperationResult(this.getAllProcessConfigWithLastVersion(), undefined);
                }
                if (!version) {
                    const processConfig = this.lastProcessConfig.get(processId);
                    if (!processConfig) {
                        return new OperationResult('', new Error('Invalid processId'));
                    }
                    return new OperationResult(processConfig, undefined);
                } else {
                    return new OperationResult(this.allProcessConfig.get(processId)?.get(version), undefined);
                }
            case ResourceType.PROCESS_HISTORY:
                if (!processId) return new OperationResult('', new Error('Invalid processId'));
                const configs = this.getProcessConfigWithAllVersion(processId);
                if (configs) {
                    return new OperationResult(configs, undefined);
                }
                return new OperationResult('', new Error('Invalid processId'));
            default:
                return new OperationResult('', new Error('Invalid resource type ' + resourceType));
        }
        try {
            return new OperationResult(fs.readFileSync(resourcePath).toString(), undefined);
        } catch (error) {
            return new OperationResult('', new Error('Cannot read file' + error));
        }
    }

    private getAllProcessConfigWithLastVersion(): any {
        const result = [];
        for (const [key, value] of this.lastProcessConfig) {
            result.push(value);
        }
        return result;
    }

    private getAllProcessConfig(): any {
        const result = [];
        for (const [key, value] of this.allProcessConfig) {
            for (const [key2, value2] of value) {
                result.push(value2);
            }
        }
        return result;
    }

    private getProcessConfigWithAllVersion(processId: string): any {
        const processConfig = this.allProcessConfig.get(processId);
        if (processConfig) {
            let result = [];
            for (const [key, value] of processConfig) {
                result.push(value);
            }
            return result;
        }
        return undefined;
    }

    public deleteBundle(processId: string, version: string | undefined): OperationResult<void> {
        if (this.allProcessConfig.get(processId) == undefined) {
            return OperationResult.error(new Error(`Process ${processId} not found`));
        }
        if (version && !this.allProcessConfig.get(processId)?.has(version)) {
            return OperationResult.error(new Error(`Process version ${version} not found for process ${processId}`));
        }
        const numberOfVersions = this.allProcessConfig.get(processId)?.size || 0;
        if (version && numberOfVersions > 1) {
            fs.rmSync(`${this.storagePath}/bundles/${processId}/${version}`, {recursive: true, force: true});

            if (this.lastProcessConfig.get(processId)?.version === version) {
                const newestConfigPath = this.findNewestConfigJson(processId);
                fs.copyFileSync(`${newestConfigPath}`, `${this.storagePath}/bundles/${processId}/config.json`);
                this.lastProcessConfig.set(
                    processId,
                    JSON.parse(fs.readFileSync(`${this.storagePath}/bundles/${processId}/config.json`).toString())
                );
            }
            this.allProcessConfig.get(processId)?.delete(version);
            return OperationResult.success(undefined);
        }
        if (!fs.existsSync(`${this.storagePath}/bundles/${processId}`)) {
            return OperationResult.error(new Error('Process not found'));
        }
        fs.rmSync(`${this.storagePath}/bundles/${processId}`, {recursive: true, force: true});
        this.lastProcessConfig.delete(processId);
        this.allProcessConfig.delete(processId);
        return OperationResult.success(undefined);
    }

    private findNewestConfigJson(processId: string): string | undefined {
        const processPath = path.join(this.storagePath, 'bundles', processId);
        if (!fs.existsSync(processPath)) {
            console.error('Process directory does not exist');
            return undefined;
        }

        let newestConfigPath: string | undefined;
        let newestConfigTime: number = 0;

        // List all version directories
        const versions = fs
            .readdirSync(processPath, {withFileTypes: true})
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

        // Iterate over each version to find the newest config.json
        versions.forEach((version) => {
            const configPath = path.join(processPath, version, 'config.json');
            if (fs.existsSync(configPath)) {
                const stats = fs.statSync(configPath);
                if (stats.mtimeMs > newestConfigTime) {
                    newestConfigTime = stats.mtimeMs;
                    newestConfigPath = configPath;
                }
            }
        });

        return newestConfigPath;
    }
}
