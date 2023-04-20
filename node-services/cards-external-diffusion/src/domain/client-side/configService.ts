/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import ConfigDTO from "./configDTO";


const fs = require('fs');


export default class ConfigService {

    config: ConfigDTO;
    configFilePath: string | null;
    logger: any;

    constructor(defaultConfig: any, configFilePath: string | null, logger: any) {



        this.configFilePath = configFilePath;
        this.logger = logger;

        try {
            if (configFilePath && fs.existsSync(configFilePath)) {
                this.loadFromFile();
            } else {
                this.config = new ConfigDTO();

                this.config.mailFrom = defaultConfig.mailFrom;
                this.config.subjectPrefix = defaultConfig.subjectPrefix;
                this.config.bodyPrefix =  defaultConfig.bodyPrefix;
                this.config.windowInSecondsForCardSearch = defaultConfig.windowInSecondsForCardSearch;
                this.config.secondsAfterPublicationToConsiderCardAsNotRead = defaultConfig.secondsAfterPublicationToConsiderCardAsNotRead;
                this.config.checkPeriodInSeconds =  defaultConfig.checkPeriodInSeconds;
                this.save();
            }
          } catch(err) {
            this.logger.error(err)
          }

    }

    private loadFromFile() {
        let rawdata = fs.readFileSync(this.configFilePath);
        this.config = JSON.parse(rawdata);
    }

    private save() {
      if (this.configFilePath) {
        let data = JSON.stringify(this.config);
        fs.writeFileSync(this.configFilePath, data);
      }
    }

    getConfig() : ConfigDTO {
        return this.config;
    }

    public patch(update: any) : ConfigDTO {
        try {
            for (const [key, value] of Object.entries(update)) {          
              if (this.config.hasOwnProperty(key) && value != null && value != undefined) {
                (this.config as any)[key] = value;
              }
            }
            this.save();
          } catch (error) {
            this.logger.error(error);
          }

        return this.config;

    }
}