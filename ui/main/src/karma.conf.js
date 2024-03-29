/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

/// Karma configuration file, see url for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-jasmine-html-reporter'),
            require('karma-coverage-istanbul-reporter'),
            require('karma-mocha-reporter'),
            require('@angular-devkit/build-angular/plugins/karma'),
            require('karma-junit-reporter')
        ],
        client: {
            clearContext: false // leave Jasmine Spec Runner output visible in browser
        },
        coverageIstanbulReporter: {
            dir: require('path').join(__dirname, '../reports/coverage'),
            reports: ['html', 'lcovonly'],
            fixWebpackSourcePaths: true
        },
        junitReporter: {
            outputDir: '../reports/test', // results will be saved as $outputDir/$browserName.xml
            outputFile: 'junit.xml', // if included, results will be saved as $outputDir/$browserName/$outputFile
            useBrowserName: false // add browser name to report and classes names
        },
        // add converage-istanbul for migration to angular 13  , see
        // https://stackoverflow.com/questions/70045859/after-upgrading-to-angular-13-the-tests-with-code-coverage-is-failing/70046050
        reporters: ['mocha', 'kjhtml', 'junit', 'coverage-istanbul'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        browserConsoleLogOptions: {
            level: 'debug',
            format: '%b %T: %m',
            terminal: true
        },
        autoWatch: true,
        browsers: ['ChromeTest'],
        singleRun: false,
        customLaunchers: {
            ChromeHeadless: {
                base: 'Chrome',
                flags: [
                    '--headless',
                    '--disable-gpu',
                    // Without a remote debugging port, Google Chrome exits immediately.
                    '--remote-debugging-port=9222',
                    // avoid prompt for local password on start
                    '--password-store=basic'
                ]
            },
            ChromeTest: {
                base: 'Chrome',
                flags: [
                    // avoid prompt for local password on start
                    '--password-store=basic',
                    // Without a remote debugging port, Google Chrome exits immediately.
                    '--remote-debugging-port=9222'
                ]
            }
        }
    });
};
