/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {GlobalStyleUpdate} from '@ofActions/global-style.actions';

@Injectable()
export class GlobalStyleService {

    private static style: string;
    private static rootStyleSheet;
    private static rootRulesNumber;

    private static DAY_STYLE = `:root { --opfab-bgcolor: white;
                                        --opfab-bgcolor-darker: #F3F2F1;
                                        --opfab-text-color: black;
                                        --opfab-text-color-stronger: black;
                                        --opfab-table-border-color: grey;
                                        --opfab-input-text-color : black;
                                        --opfab-form-label-text-color: black;
                                        --opfab-form-border-color:  #9C9B9B;
                                        --opfab-button-disable-bgcolor: #DBDBDB;
                                        --opfab-popover-bgcolor: #f3f2f1;
                                        --opfab-feedbar-icon-color: black;
                                        --opfab-feedbar-icon-hover-color:#212529;
                                        --opfab-feedbar-icon-hover-bgcolor: #F3F2F1;
                                        --opfab-timeline-bgcolor: #F3F2F1;
                                        --opfab-timeline-text-color: #000000;
                                        --opfab-timeline-grid-color: #C9CCD1;
                                        --opfab-timeline-week-color: #aaaaaa;
                                        --opfab-timeline-week-color2: #aaaaaa;
                                        --opfab-timeline-week-bgcolor: #ffffff;
                                        --opfab-timeline-realtimebar-color: #2784FF;
                                        --opfab-timeline-button-bgcolor: #e5e5e5;
                                        --opfab-timeline-button-text-color: #49494a;
                                        --opfab-timeline-button-selected-bgcolor: #49494a;
                                        --opfab-timeline-button-selected-text-color: #fcfdfd;
                                        --opfab-lightcard-detail-bgcolor: #F3F2F1;
                                        --opfab-lightcard-detail-textcolor: black;
                                        --opfab-lightcard-detail-border-color: #cccccc;
                                        --opfab-lightcard-detail-selected-bgcolor: #E1E1E1;
                                        --opfab-lightcard-detail-unread-textcolor: black;
                                        --opfab-light-card-lttd-timeleft: #ff6600;
                                        --opfab-card-tab-selected-text-color: black;
                                        --opfab-card-tab-border-color: ##111D2D;
                                        --opfab-card-bgcolor : #F3F2F1;
                                        --opfab-card-shadow: 0 2px 4px 0 rgba(0,0,0,0.5);
                                        --opfab-card-detail-border-color : #dddddd;
                                        --opfab-navbar-color: black;
                                        --opfab-navbar-color-hover:black;
                                        --opfab-navbar-color-active:black;
                                        --opfab-navbar-toggler-icon: url("data:image/svg+xml, %3csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(0,0,0, 0.55)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
                                        --opfab-navbar-toggler-border-color: rgba(0,0,0,.1) ;
                                        --opfab-navbar-info-block-color: rgba(0,0,0,.9);
                                        --opfab-navbar-menu-link-color: #343a40;
                                        --opfab-navbar-menu-link-hover-color: #121416;
                                        --opfab-navbar-menu-bgcolor: white;
                                        --opfab-navbar-right-menu-bgcolor: #f3f2f1;
                                        --opfab-navbar-menu-bgcolor-item-active: #007bff;
                                        --opfab-navbar-menu-bgcolor-item-hover: #f8f9fa;
                                        --opfab-timeline-cardlink: #212529;
                                        --opfab-timeline-cardlink-bgcolor-hover: #e2e6ea;
                                        --opfab-timeline-cardlink-bordercolor-hover: #dae0e5;
                                        --opfab-calendar-grid-color : #C9CCD1;
                                        --opfab-scrollbar-bgcolor: #ffffff;
                                        --opfab-scrollbar-border-color: #979797;
                                        --opfab-scrollbar-bar-bgcolor: #BFC1C7;
                                        --opfab-scrollbar-bar-border-color: #979797;
                                        --opfab-scrollbar-bgcolor-firefox: #dddddd;
                                        --opfab-scrollbar-bar-bgcolor-firefox: #bbbbbb;
                                        }`;

    private static NIGHT_STYLE = `:root {
                                        --opfab-bgcolor: #262f3d;
                                        --opfab-bgcolor-darker: #131D2B;
                                        --opfab-text-color: #bababa;
                                        --opfab-text-color-stronger: white;
                                        --opfab-table-border-color: white;
                                        --opfab-input-text-color: white;
                                        --opfab-form-border-color:  #606267;
                                        --opfab-form-label-text-color: #bababa;
                                        --opfab-button-disable-bgcolor: #2B353F;
                                        --opfab-popover-bgcolor: #182638;
                                        --opfab-feedbar-icon-color: white;
                                        --opfab-feedbar-icon-hover-color:white;
                                        --opfab-feedbar-icon-hover-bgcolor:#131D2B;
                                        --opfab-timeline-bgcolor: #131D2B;
                                        --opfab-timeline-text-color: #ffffff;
                                        --opfab-timeline-grid-text-color: #bababa;
                                        --opfab-timeline-grid-color: #575757;
                                        --opfab-timeline-week-color: #B1B1B1;
                                        --opfab-timeline-week-color2: #B1B1B1;
                                        --opfab-timeline-week-bgcolor: #212B3A;
                                        --opfab-timeline-realtimebar-color: #2784FF;
                                        --opfab-timeline-button-bgcolor: rgb(221, 221, 221);
                                        --opfab-timeline-button-text-color: black;
                                        --opfab-timeline-button-selected-bgcolor: black;
                                        --opfab-timeline-button-selected-text-color: white;
                                        --opfab-lightcard-detail-bgcolor: #131D2B;
                                        --opfab-lightcard-detail-textcolor: #bababa;
                                        --opfab-lightcard-detail-border-color: #222933;
                                        --opfab-lightcard-detail-selected-bgcolor: #0F161F;
                                        --opfab-lightcard-detail-unread-textcolor: white;
                                        --opfab-light-card-lttd-timeleft: #ff6600;
                                        --opfab-card-tab-selected-text-color: #bababa;
                                        --opfab-card-tab-border-color: #bababa;
                                        --opfab-card-bgcolor :  #131D2B;
                                        --opfab-card-detail-border-color : #343a40 ;
                                        --opfab-navbar-color: #BABABA;
                                        --opfab-navbar-color-hover:white;
                                        --opfab-navbar-color-active:white;
                                        --opfab-navbar-toggler-icon: url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255,255,255, 0.55)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e\");
                                        --opfab-navbar-toggler-border-color: rgba(255,255,255,.1) ;
                                        --opfab-navbar-info-block-color: white;
                                        --opfab-navbar-menu-link-color: #343a40;
                                        --opfab-navbar-menu-link-hover-color: #121416;
                                        --opfab-navbar-menu-bgcolor: white;
                                        --opfab-navbar-right-menu-bgcolor: #182638;
                                        --opfab-navbar-menu-bgcolor-item-active: #007bff;
                                        --opfab-navbar-menu-bgcolor-item-hover: #f8f9fa;
                                        --opfab-timeline-cardlink: white;
                                        --opfab-timeline-cardlink-bgcolor-hover: #23272b;
                                        --opfab-timeline-cardlink-bordercolor-hover: #1d2124;
                                        --opfab-calendar-grid-color : #303237;
                                        --opfab-scrollbar-bgcolor: #131D2B;
                                        --opfab-scrollbar-border-color: #131D2B;
                                        --opfab-scrollbar-bar-bgcolor: #262f3d;
                                        --opfab-scrollbar-bar-border-color: #979797;
                                        --opfab-scrollbar-bgcolor-firefox: #131D2B;
                                        --opfab-scrollbar-bar-bgcolor-firefox: #333D4B;
                                    }`;


    constructor(private store: Store<AppState>) {
        const len = document.styleSheets.length;
        for (let n = 0; n < len; n++) {
            if (document.styleSheets[n].title === 'opfabRootStyle') {
                GlobalStyleService.rootStyleSheet = document.styleSheets[n];
                break;
            }
        }
    }

    public getStyle(): string {
        return GlobalStyleService.style;
    }

    public setStyle(style: string) {
        GlobalStyleService.style = style;
        switch (style) {
            case 'DAY': {
                this.setCss(GlobalStyleService.DAY_STYLE);
                break;
            }
            case 'NIGHT': {
                this.setCss(GlobalStyleService.NIGHT_STYLE);
                break;
            }
            default:
                this.setCss(GlobalStyleService.DAY_STYLE);
        }
        this.store.dispatch(new GlobalStyleUpdate({style: style}));
    }

    private setCss(cssRule: string) {
        if (GlobalStyleService.rootRulesNumber) {
            GlobalStyleService.rootStyleSheet.deleteRule(GlobalStyleService.rootRulesNumber);
        }
        GlobalStyleService.rootRulesNumber = GlobalStyleService.rootStyleSheet.insertRule(cssRule,
            GlobalStyleService.rootStyleSheet.cssRules.length);
    }
}
