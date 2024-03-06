/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {MailHandlebarsHelper} from '../src/domain/server-side/mailHandlebarsHelpers';
import * as Handlebars from 'handlebars';

describe('Handlebars Services', () => {


    beforeAll(() => {
        MailHandlebarsHelper.init();
    });

    describe('#executeTemplate', () => {

        it('deltaToHtml helper', async function () {
            const richMessage = '{\\"ops\\":[{\\"attributes\\":{\\"bold\\":true},\\"insert\\":\\"test\\"},{\\"insert\\":\\"\\n\\"}]}';
            const template = `{{{ deltaToHtml "${richMessage}" }}}`

            const templateCompiler = Handlebars.compile(template);
            const bodyHtml =  templateCompiler(richMessage);
            expect(bodyHtml).toEqual('<p><strong>test</strong></p>');
        });
    });
});
