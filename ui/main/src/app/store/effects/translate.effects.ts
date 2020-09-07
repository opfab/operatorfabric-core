/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from "@angular/core";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {Actions, Effect, ofType} from "@ngrx/effects";
import {TranslateService} from "@ngx-translate/core";
import {forkJoin, Observable, of} from "rxjs";
import {LightCardActionTypes, LoadLightCardsSuccess} from "@ofActions/light-card.actions";
import {catchError, concatAll, map, mergeMap, switchMap} from "rxjs/operators";
import {
    TranslateActions,
    TranslateActionsTypes,
    TranslationUpToDate,
    UpdateTranslation,
    UpdateTranslationFailed,
    UpdateTranslationSuccessful
} from "@ofActions/translate.actions";
import {LightCard} from "@ofModel/light-card.model";
import {Map} from "@ofModel/map";
import * as _ from 'lodash';
import {ProcessesService} from "@ofServices/processes.service";
import {Menu} from "@ofModel/processes.model";
import {LoadMenuSuccess, MenuActionTypes} from "@ofActions/menu.actions";

@Injectable()
export class TranslateEffects {


    constructor(private store: Store<AppState>
        , private actions$: Actions
        , private translate: TranslateService
        , private businessconfigService: ProcessesService
    ) {
    }

    private static i18nBundleVersionLoaded = new Map<Set<string>>();

    @Effect()
    updateTranslateService: Observable<TranslateActions> = this.actions$
        .pipe(
            ofType(TranslateActionsTypes.UpdateTranslation)
            ,
            mergeMap((action: UpdateTranslation) => {
                const businessconfigWithTheirVersions = action.payload.versions;
                return forkJoin(this.mapLanguages(businessconfigWithTheirVersions)).pipe(
                    concatAll(),
                    catchError((error, caught) => {
                        console.error(new Date().toISOString(),'error while trying to update translation', error);
                        return caught;
                    }));
            })
            ,
            map(elem => new UpdateTranslationSuccessful({language: this.translate.currentLang}))
            ,
            catchError(error => {
                return of(new UpdateTranslationFailed({error: error}))
            })
        );

// iterate over configured languages
    mapLanguages(businessconfigAndVersions: Map<Set<string>>): Observable<boolean>[] {
        const locales = this.translate.getLangs();
        return locales.map(locale => {
            return forkJoin(this.mapBusinessconfig(locale, businessconfigAndVersions))
                .pipe(concatAll())
        });
    }

    // iterate over businessconfig
    mapBusinessconfig(locale: string, businessconfigAndVersion: Map<Set<string>>): Observable<boolean>[] {
        const businessconfig = Object.keys(businessconfigAndVersion);

        return businessconfig.map(businessconfig => {
            return forkJoin(this.mapVersions(locale, businessconfig, businessconfigAndVersion[businessconfig]))
                .pipe(concatAll());
        })
    }

    // iterate over versions
    mapVersions(locale: string, process: string, versions: Set<string>): Observable<boolean>[] {
        return Array.from(versions.values()).map(version => {
            return this.businessconfigService.askForI18nJson(process, locale, version)
                .pipe(map(i18n => {
                    this.translate.setTranslation(locale, i18n, true);
                    return true;
                }));
        });
    }


    @Effect()
    verifyTranslationNeeded: Observable<TranslateActions> = this.actions$
        .pipe(
            ofType(LightCardActionTypes.LoadLightCardsSuccess)
            // extract cards
            , map((loadedCardAction: LoadLightCardsSuccess) => loadedCardAction.payload.lightCards)
            // extract businessconfig+version
            , map((cards: LightCard[]) => TranslateEffects.extractProcessAssociatedWithDistinctVersionsFromCards(cards))
            // extract version needing to be updated
            , switchMap((versions: Map<Set<string>>) => {
                return this.extractI18nToUpdate(versions);
            })
            // send action accordingly
            , map((processAndVersion: Map<Set<string>>) => {
                return TranslateEffects.sendTranslateAction(processAndVersion)
            })
        );

    private extractI18nToUpdate(versions: Map<Set<string>>) {
            return of(TranslateEffects.extractBusinessconfigToUpdate(versions, TranslateEffects.i18nBundleVersionLoaded));
    }

    static extractProcessAssociatedWithDistinctVersionsFromCards(cards: LightCard[]): Map<Set<string>> {
        let businessconfigAndVersions: TransitionalBusinessconfigWithItSVersion[];
        businessconfigAndVersions = cards.map(card => {
            return new TransitionalBusinessconfigWithItSVersion(card.process,card.processVersion);
        });
        
        return this.consolidateBusinessconfigAndVersions(businessconfigAndVersions);
    }

    @Effect()
    verifyTranslationNeedForMenus:Observable<TranslateActions> = this.actions$
        .pipe(
            ofType(MenuActionTypes.LoadMenuSuccess)
            , map((loadedMenusAction:LoadMenuSuccess)=>loadedMenusAction.payload.menu)
            , map((menus:Menu[])=>TranslateEffects.extractProcessAssociatedWithDistinctVersionsFrom(menus))
            , switchMap((versions: Map<Set<string>>)=>this.extractI18nToUpdate(versions))
            , map((processAndVersions:Map<Set<string>>)=>TranslateEffects.sendTranslateAction(processAndVersions))


        );


    static extractProcessAssociatedWithDistinctVersionsFrom(menus: Menu[]):Map<Set<string>>{
        
        const businessconfigAndVersions = menus.map(menu=>{
            return new TransitionalBusinessconfigWithItSVersion(menu.id,menu.version);
        })
        return this.consolidateBusinessconfigAndVersions(businessconfigAndVersions);

    }

    private static consolidateBusinessconfigAndVersions(businessconfigAndVersions:TransitionalBusinessconfigWithItSVersion[]) {
        const result = new Map<Set<string>>();
        businessconfigAndVersions.forEach(u => {
            const versions = result[u.businessconfig];
            if (versions) {
                versions.add(u.version)
            } else {
                result[u.businessconfig] = new Set([u.version]);
            }
        });
        return result;
    }

    static extractBusinessconfigToUpdate(versionInput: Map<Set<string>>, cachedVersions: Map<Set<string>>): Map<Set<string>> {
        const inputProcesses = Object.keys(versionInput);
        const cachedProcesses = Object.keys(cachedVersions);
        const unCachedProcesses = _.difference(inputProcesses, cachedProcesses);

        const translationReferencesToUpdate = new Map<Set<string>>();
        unCachedProcesses.forEach(process => {
            const versions2Update = versionInput[process];
            translationReferencesToUpdate[process] = versions2Update;
        });

        let cachedProcessesForVersionVerification = inputProcesses;
        if (unCachedProcesses && (unCachedProcesses.length > 0)) {
            cachedProcessesForVersionVerification = _.difference(unCachedProcesses, inputProcesses);
        }

        cachedProcessesForVersionVerification.forEach(businessconfig => {
            const currentInputVersions = versionInput[businessconfig];
            const currentCachedVersions = cachedVersions[businessconfig];
            const untrackedVersions = _.difference(Array.from(currentInputVersions), Array.from(currentCachedVersions));
            if (untrackedVersions && Object.keys(untrackedVersions).length > 0) {
                translationReferencesToUpdate[businessconfig] = new Set(untrackedVersions);
            }
        });
        const nbOfProcess = Object.keys(translationReferencesToUpdate).length;
        return (nbOfProcess > 0) ? translationReferencesToUpdate : null;
    }

    static sendTranslateAction(versionToUpdate: Map<Set<string>>): TranslateActions {
        if (versionToUpdate) {
            TranslateEffects.i18nBundleVersionLoaded = {...TranslateEffects.i18nBundleVersionLoaded, ...versionToUpdate};
            return new UpdateTranslation({versions: versionToUpdate});
            }
        return new TranslationUpToDate();
    }
}

class TransitionalBusinessconfigWithItSVersion {
    constructor(public businessconfig:string, public version:string){}
}

