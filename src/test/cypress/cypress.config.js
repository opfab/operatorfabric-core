/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
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
        'deleteFile': readXlsx.deleteFile},
        on('before:browser:launch', (browser = {}, launchOptions) => {
        
          // the browser width and height we want to get
          // our screenshots and videos will be of that resolution
          const width = 1920
          const height = 1080
        
          console.log('  Setting the browser window size to %d x %d', width, height)
        
          if (browser.name === 'chrome' && browser.isHeadless) {
            launchOptions.args.push(`--window-size=${width},${height}`)
        
            // force screen to be non-retina and just use our given resolution
            launchOptions.args.push('--force-device-scale-factor=1')
          }
        
          if (browser.name === 'electron' && browser.isHeadless) {
            // might not work on CI for some reason
            launchOptions.preferences.width = width
            launchOptions.preferences.height = height
          }
        
          if (browser.name === 'firefox' && browser.isHeadless) {
            launchOptions.args.push(`--width=${width}`)
            launchOptions.args.push(`--height=${height}`)
          }
        
          // IMPORTANT: return the updated browser launch options
          return launchOptions
        }))
    }
  }
});


