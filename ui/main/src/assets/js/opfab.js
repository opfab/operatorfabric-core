/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const opfab = {};

opfab.multiSelect = {
    init: function (config) {
        const multiSelect = {
            id: config.id,
            getSelectedValues() {
                return document.querySelector('#' + config.id).value;
            },
            setSelectedValues(values) {
                document.querySelector('#' + config.id).setValue(values);
            },
            setOptions(options) {
                document.querySelector('#' + config.id).setOptions(options);
            },
            enable() {
                document.querySelector('#' + config.id).enable();
            },
            disable() {
                document.querySelector('#' + config.id).disable();
            }
        };
        VirtualSelect.init({
            ele: '#' + config.id,
            options: config.options,
            optionsCount: 8,
            multiple: config.multiple,
            showValueAsTags: true,
            placeholder: '',
            selectAllOnlyVisible: true,
            searchPlaceholderText: opfab.utils.getTranslation('multiSelect.searchPlaceholderText'),
            clearButtonText: opfab.utils.getTranslation('multiSelect.clearButtonText'),
            noOptionsText: opfab.utils.getTranslation('multiSelect.noOptionsText'),
            noSearchResultsText: opfab.utils.getTranslation('multiSelect.noSearchResultsText'),
            search: config.search,
            hideClearButton: config.multiple !== undefined ? !config.multiple : false,
            allowNewOption: config.allowNewOption !== undefined ? config.allowNewOption : false,
            autoSelectFirstOption: config.autoSelectFirstOption !== undefined ? config.autoSelectFirstOption : false
        });
        return multiSelect;
    }
};

opfab.richTextEditor = {
    showRichMessage(element) {
        const delta = element.innerHTML;
        try {
            element.innerHTML = this.getHtml(delta);
            element.classList.add('ql-editor');
        } catch (e) {
            console.log('Impossible to convert delta to html , delta = ', delta);
            console.error(e);
        }
    },

    getHtml: function (delta) {
        const container = document.createElement('div');
        const quill = new Quill(container, {sanitize: true});
        quill.setContents(this.getJson(delta));
        const html = quill.root.innerHTML;
        container.remove();
        return html;
    },

    getPlainText: function (delta) {
        let delta_obj = null;
        if (typeof delta === 'string') delta_obj = JSON.parse(delta);
        else if (typeof delta === 'object') delta_obj = delta;

        if (delta_obj === null || !('ops' in delta_obj)) throw "Can't convert invalid Quill Delta to plaintext!";

        let plaintext = '';
        for (let i = 0; i < delta_obj.ops.length; i++) {
            const op = delta_obj.ops[i];
            if (op.insert) {
                if (typeof op.insert === 'string') {
                    plaintext += op.insert;
                } else {
                    plaintext += ' ';
                }
            }
        }
        return plaintext;
    },

    getJson: function (input) {
        if (input) {
            const element = document.createElement('textarea');
            element.innerHTML = input.trim();
            // escape line breaks for json parsing
            let decoded = element.childNodes[0].nodeValue.replace(/\n/g, '\\n');
            element.remove();
            return JSON.parse(decoded);
        }
        return null;
    },

    getDeltaFromText(message) {
        const delta = {ops: [{insert: message}]};
        return JSON.stringify(delta);
    }
};

class QuillEditor extends HTMLElement {
    constructor() {
        super();
        this.init();
        this.EMPTY_REGEXP = /^<p>(<br>|<br\/>|<br\s\/>|\s+|)<\/p>$/m;

        const toolbarOptions = [
            [{header: [1, 2, 3, 4, 5, 6, false]}],
            [{color: []}],
            ['bold', 'italic', 'underline', 'link'],
            [{align: []}],
            [{list: 'bullet'}, {list: 'ordered'}],
            [{indent: '-1'}, {indent: '+1'}],
            ['clean']
        ];

        this.quill = new Quill(this, {
            modules: {
                toolbar: toolbarOptions
            },
            theme: 'snow',
            sanitize: true
        });
        this.setDefaultLinkPlaceholder('');
    }

    init() {
        const Link = Quill.import('formats/link');

        class CustomLinkSanitizer extends Link {
            static sanitize(url) {
                const sanitizedUrl = super.sanitize(url);

                // Not whitelisted URL based on protocol so, let's return `blank`
                if (!sanitizedUrl || sanitizedUrl === 'about:blank') return sanitizedUrl;

                const hasWhitelistedProtocol = this.PROTOCOL_WHITELIST.some(function (protocol) {
                    return sanitizedUrl.startsWith(protocol);
                });

                if (hasWhitelistedProtocol) return sanitizedUrl;

                return `https://${sanitizedUrl}`;
            }
        }

        Quill.register(CustomLinkSanitizer, true);
    }

    setDefaultLinkPlaceholder(placeholder) {
        const tooltip = this.quill.theme.tooltip;
        const input = tooltip.root.querySelector('input[data-link]');
        input.dataset.link = placeholder;
    }

    setContents(value) {
        this.quill.setContents(opfab.richTextEditor.getJson(value));
    }

    getContents() {
        return JSON.stringify(this.quill.getContents());
    }

    getHtml() {
        return this.quill.root.innerHTML;
    }

    isEmpty() {
        return this.EMPTY_REGEXP.test(this.quill.root.innerHTML);
    }

    enable(enabled) {
        this.quill.enable(enabled);
    }

    // Lifecycle method: called when the element is added to the DOM
    connectedCallback() {
        const textEditor = this.firstChild;
        const pNode = textEditor.firstChild;
        const childNode = pNode.firstChild;

        if (childNode?.nodeValue && childNode.nodeValue.length > 0) this.setContents(childNode.nodeValue);
    }
}

// Define the custom element
customElements.define('opfab-richtext-editor', QuillEditor);
