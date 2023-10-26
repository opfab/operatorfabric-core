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
        const edjsParser  = edjsHTML(); 
        return edjsParser.parse(this.getJson(content));
    },

    getJson: function(content) {
        var e = document.createElement('textarea');
        e.innerHTML = content;
        // escape line breaks for json parsing
        let decoded = e.childNodes[0].nodeValue.replace(/\n/g, "\\n");

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
            },
            tools: {
                Color: {
                  class: ColorPlugin, // if load from CDN, please try: window.ColorPlugin
                  config: {
                     colorCollections: ['#EC7878','#9C27B0','#673AB7','#3F51B5','#0070FF','#03A9F4','#00BCD4','#4CAF50','#8BC34A','#CDDC39', '#FFF'],
                     defaultColor: '#FF1300',
                     type: 'text', 
                     customPicker: true // add a button to allow selecting any colour  
                  }     
                },
                Marker: {
                  class: ColorPlugin, // if load from CDN, please try: window.ColorPlugin
                  config: {
                     defaultColor: '#FFBF00',
                     type: 'marker',
                     icon: `<svg fill="#000000" height="200px" width="200px" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M17.6,6L6.9,16.7c-0.2,0.2-0.3,0.4-0.3,0.6L6,23.9c0,0.3,0.1,0.6,0.3,0.8C6.5,24.9,6.7,25,7,25c0,0,0.1,0,0.1,0l6.6-0.6 c0.2,0,0.5-0.1,0.6-0.3L25,13.4L17.6,6z"></path> <path d="M26.4,12l1.4-1.4c1.2-1.2,1.1-3.1-0.1-4.3l-3-3c-0.6-0.6-1.3-0.9-2.2-0.9c-0.8,0-1.6,0.3-2.2,0.9L19,4.6L26.4,12z"></path> </g> <g> <path d="M28,29H4c-0.6,0-1-0.4-1-1s0.4-1,1-1h24c0.6,0,1,0.4,1,1S28.6,29,28,29z"></path> </g> </g></svg>`
                    }       
                },
              },
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
                },
                tools: {
                    Color: {
                    class: ColorPlugin, // if load from CDN, please try: window.ColorPlugin
                    config: {
                        colorCollections: ['#EC7878','#9C27B0','#673AB7','#3F51B5','#0070FF','#03A9F4','#00BCD4','#4CAF50','#8BC34A','#CDDC39', '#FFF'],
                        defaultColor: '#FF1300',
                        type: 'text', 
                        customPicker: true // add a button to allow selecting any colour  
                    }     
                    },
                    Marker: {
                    class: ColorPlugin, // if load from CDN, please try: window.ColorPlugin
                    config: {
                        defaultColor: '#FFBF00',
                        type: 'marker',
                        icon: `<svg fill="#000000" height="200px" width="200px" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M17.6,6L6.9,16.7c-0.2,0.2-0.3,0.4-0.3,0.6L6,23.9c0,0.3,0.1,0.6,0.3,0.8C6.5,24.9,6.7,25,7,25c0,0,0.1,0,0.1,0l6.6-0.6 c0.2,0,0.5-0.1,0.6-0.3L25,13.4L17.6,6z"></path> <path d="M26.4,12l1.4-1.4c1.2-1.2,1.1-3.1-0.1-4.3l-3-3c-0.6-0.6-1.3-0.9-2.2-0.9c-0.8,0-1.6,0.3-2.2,0.9L19,4.6L26.4,12z"></path> </g> <g> <path d="M28,29H4c-0.6,0-1-0.4-1-1s0.4-1,1-1h24c0.6,0,1,0.4,1,1S28.6,29,28,29z"></path> </g> </g></svg>`
                        }       
                    },
                },
            });
        }
    }

    getContent() {
        return JSON.stringify(this.content);
    }

}


customElements.define('opfab-richtext-editor', RichTextEditor);