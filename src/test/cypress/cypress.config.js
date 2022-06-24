const { defineConfig } = require("cypress");
const readXlsx = require("./cypress/plugins/read-xlsx");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:2002/ui/",
    viewportWidth: 1848,
    viewportHeight: 949,
    chromeWebSecurity: false,
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
