/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const { defineConfig } = require("cypress");
const readXlsx = require("./cypress/plugins/read-xlsx");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:2002/",
    viewportWidth: 1848,
    viewportHeight: 949,
    chromeWebSecurity: false,
    numTestsKeptInMemory: 20,
    defaultCommandTimeout: 6000,
    specPattern: 'cypress/integration/**/*.spec.js',

    env: {
      defaultWaitTime: 500,
      host: "http://localhost",
    },

    setupNodeEvents(on, config) {
      require('cypress-terminal-report/src/installLogsPrinter')(on);
      on('task', {
        'readXlsx': readXlsx.read,
        'list': readXlsx.list,
        'deleteFile': readXlsx.deleteFile})
    }
  }
});
