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
    // these values are to be provided at launch by opfab angular application
    // it is done in i18n.service.ts
    searchPlaceholderText: '',
    clearButtonText: 'test',
    noOptionsText: '',
    noSearchResultsText: '',

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
            searchPlaceholderText: this.searchPlaceholderText,
            clearButtonText: this.clearButtonText,
            noOptionsText: this.noOptionsText,
            noSearchResultsText: this.noSearchResultsText,
            search: config.search,
            hideClearButton: config.multiple !== undefined ? !config.multiple : false,
            allowNewOption: config.allowNewOption !== undefined ? config.allowNewOption : false,
            autoSelectFirstOption: config.autoSelectFirstOption !== undefined ? config.autoSelectFirstOption : false
        });
        return multiSelect;
    }
};

opfab.utils = {
    escapeHtml: function (htmlStr) {
        if (!htmlStr) return htmlStr;
        return htmlStr
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    convertSpacesAndNewLinesInHTML: function (txt) {
        return txt.replace(/\n/g, '<br/>').replace(/\s\s/g, '&nbsp;&nbsp;');
    },

    getTranslation: function (key, param) {}

};

opfab.businessconfig = {
    businessData: {
        get: function (resourceName) {}
    }
};

opfab.users = {
    entities: {
        getEntityName: function (entityId) {},
        getEntity: function (entityId) {},
        getAllEntities: function () {}
    }
};

opfab.navigate = {
    showCardInFeed: function (cardId) {},
    redirectToBusinessMenu: function (menuId, urlExtension) {}
};

opfab.currentCard = {
    getCard: function() {},
    isUserAllowedToRespond: function () {},
    isUserMemberOfAnEntityRequiredToRespond: function () {},
    getEntitiesAllowedToRespond: function () {},
    getEntityUsedForUserResponse: function () {},
    getDisplayContext: function () {},
    isResponseLocked: function () {},
    getChildCards: function () {},
    displayLoadingSpinner: function () {},
    hideLoadingSpinner: function () {},
    registerFunctionToGetUserResponse: function (getUserResponse) {},
    listenToResponseLock(listener) {},
    listenToResponseUnlock(listener) {},
    listenToLttdExpired(listener) {},
    listenToStyleChange(listener) {},
    listenToScreenSize(listener) {},
    listenToTemplateRenderingComplete(listener) {},
    listenToChildCards(listener) {}
};

opfab.currentUserCard = {
    getEditionMode: function () {},
    getEndDate: function () {},
    getExpirationDate: function () {},
    getLttd: function () {},
    getProcessId: function () {},
    getSelectedEntityRecipients: function () {},
    getSelectedEntityForInformationRecipients: function () {},
    getStartDate: function () {},
    getState: function () {},
    getUserEntityChildCard: function () {},
    listenToEntityUsedForSendingCard: function (listener) {},
    registerFunctionToGetSpecificCardInformation: function (getSpecificCardInformation) {},
    setDropdownEntityRecipientList: function (recipients) {},
    setDropdownEntityRecipientForInformationList: function (recipients) {},
    setInitialEndDate: function (endDate) {},
    setInitialExpirationDate: function (expirationDate) {},
    setInitialLttd: function (lttd) {},
    setInitialSelectedRecipients: function (recipients) {},
    setInitialSelectedRecipientsForInformation: function (recipients) {},
    setSelectedRecipients: function (recipients) {},
    setSelectedRecipientsForInformation: function (recipients) {},
    setInitialSeverity: function (initialSeverity) {},
    setInitialStartDate: function (startDate) {}
};


opfab.richTextEditor = {

    showRichMessage(element) {
        const delta = element.innerHTML;
        element.innerHTML = this.getHtml(delta);
        element.classList.add('ql-editor');
    },
 
    getHtml: function (delta) {
        const container = document.createElement("div");
        const quill = new Quill(container,  {sanitize: true});
        quill.setContents(this.getJson(delta));
        const html = quill.root.innerHTML;
        container.remove();
        return html;
    },

    getJson: function (input) {
        if (input) {
            const element = document.createElement('textarea');
            element.innerHTML = input.trim();
            // escape line breaks for json parsing
            let decoded = element.childNodes[0].nodeValue.replace(/\n/g, "\\n");
            element.remove();
            return JSON.parse(decoded);
        }
        return null;

    },

    getDeltaFromText(message) {
        const delta ={ops: [{ insert: message }] };
        return JSON.stringify(delta);
    }

};

class QuillEditor extends HTMLElement {


    constructor() {
        super();
        this.init();
        this.EMPTY_REGEXP = /^<p>(<br>|<br\/>|<br\s\/>|\s+|)<\/p>$/m;

        const toolbarOptions = [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }],
            ['bold', 'italic', 'underline', 'link'],
            [{ 'align': [] }],
            [{ 'list': 'bullet' }, { 'list': 'ordered' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
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

              const sanitizedUrl = super.sanitize(url)
          
              // Not whitelisted URL based on protocol so, let's return `blank`
              if (!sanitizedUrl || sanitizedUrl === 'about:blank') return sanitizedUrl
          
              const hasWhitelistedProtocol = this.PROTOCOL_WHITELIST.some(function(protocol) {
                return sanitizedUrl.startsWith(protocol)
              })
          
              if (hasWhitelistedProtocol) return sanitizedUrl
          
              return `https://${sanitizedUrl}`
            }
          }
          
          Quill.register(CustomLinkSanitizer, true);
    }

    setDefaultLinkPlaceholder(placeholder) {
        const tooltip = this.quill.theme.tooltip;
        const input = tooltip.root.querySelector("input[data-link]");
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

    // Lifecycle method: called when the element is added to the DOM
    connectedCallback() {
        const textEditor = this.firstChild;
        const pNode = textEditor.firstChild;
        const childNode = pNode.firstChild;

        if (childNode?.nodeValue && childNode.nodeValue.length > 0)
            this.setContents(childNode.nodeValue);

    }

}

  // Define the custom element
  customElements.define('opfab-richtext-editor', QuillEditor);


