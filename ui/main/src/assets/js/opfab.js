/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const opfab = {};

opfab.multiSelect = {
    // these value is to be provided at startup by opfab angular application
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
            hideClearButton: config.multiple !== undefined ? !config.multiple : false
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
    redirectToBusinessMenu: function (menuId, menuItemId, urlExtension) {}
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

    getHtml: function (content) {
        console.log("getHtml content " + content);
        const edjsParser  = edjsHTML(); 
        return edjsParser.parse(this.getJson(content));
    },

    getJson: function(content) {
        var e = document.createElement('textarea');
        e.innerHTML = content;
        // escape line breaks for json parsing
        let decoded = e.childNodes[0].nodeValue.replace(/\n/g, "\\n");
        console.log("getJson decoded " + decoded);
        return JSON.parse(decoded);
    }

};


class RichTextEditor extends HTMLElement {
    content;
    constructor() {
        super();

        this.id = this.getAttribute('id');
        if (!this.id) {
            this.setAttribute('id', 'editorjs');
            this.id = 'editorjs';
        }

        this.editor = new EditorJS( {
            holder : this.id,
            onChange: (api, event) => {
                this.editor.save().then( outData => {
                    this.content = outData;
                })
            }
        });


    }

    setContent(data) {
        if (data) {
            this.removeChild(this.firstChild)
     
            const contentObj = opfab.richTextEditor.getJson(data);

            this.editor = new EditorJS( {
                holder : this.id,
                data: contentObj,
                onChange: (api, event) => {
                    this.editor.save().then( outData => {
                        this.content = outData;
                    })
                }
            });
        }
    }

    getContent() {
        return JSON.stringify(this.content);
    }

}


customElements.define('opfab-richtext-editor', RichTextEditor);