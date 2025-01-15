/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 *  See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, Component, OnInit, Renderer2} from '@angular/core';

import {Clipboard} from '@angular/cdk/clipboard';
import {TranslateModule} from '@ngx-translate/core';
import {TranslationService} from '@ofServices/translation/TranslationService';

@Component({
    selector: 'of-richtext-helper',
    templateUrl: './richtext.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [TranslateModule]
})
export class RichTextComponent implements OnInit {
    modules = {
        toolbar: [
            [{header: [1, 2, 3, 4, 5, 6, false]}],
            [{color: []}],
            ['bold', 'italic', 'underline', 'link'],
            [{align: []}],
            [{list: 'bullet'}, {list: 'ordered'}],
            [{indent: '-1'}, {indent: '+1'}],
            ['clean']
        ]
    };

    delta: string;

    constructor(
        private readonly clipboard: Clipboard,
        public renderer: Renderer2
    ) {}
    ngOnInit(): void {
        const label = TranslationService.getTranslation('devtools.richTextComposer.richTextEditor');
        const container = document.getElementById('richtext');
        container.innerHTML = `
        <label translate>${label}</label>
        <opfab-richtext-editor id="rich-editor"></opfab-richtext-editor>
        `;
    }

    convert() {
        const quillEditor = document.getElementById('rich-editor') as any;
        this.delta = quillEditor.getContents();
    }

    copyToClipboard(): void {
        this.clipboard.copy(this.delta);
    }
}
