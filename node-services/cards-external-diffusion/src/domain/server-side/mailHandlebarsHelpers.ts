/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import * as Handlebars from 'handlebars';
import {JSDOM} from 'jsdom'

export class MailHandlebarsHelper {

    private static quill: any;

    public static init() {
        const fs = require('fs');
        const quillFilePath = require.resolve('quill');
        const quillMinFilePath = quillFilePath.replace('quill.js', 'quill.min.js');
        
        const quillLibrary = fs.readFileSync(quillMinFilePath);
    
        const TEMPLATE =  `<div id="editor"></div>
        <script>${quillLibrary}</script>
        <script>
          document.getSelection = function() {
            return {
              getRangeAt: function() { }
            };
          };
          document.execCommand = function (command, showUI, value) {
            try {
                return document.execCommand(command, showUI, value);
            } catch(e) {}
            return false;
          };
        </script>`

        const DOM = new JSDOM(TEMPLATE, { runScripts: 'dangerously', resources: 'usable' });
        MailHandlebarsHelper.quill = new DOM.window.Quill('#editor');
        MailHandlebarsHelper.registerDeltaToHtml();
    }

    private static registerDeltaToHtml() {
        Handlebars.registerHelper('deltaToHtml', (delta) => {
            try {
                MailHandlebarsHelper.quill.setContents(JSON.parse(delta));            
            } catch (error) {
                return '';
            }
            return MailHandlebarsHelper.quill.root.innerHTML;
        });
    }
}

