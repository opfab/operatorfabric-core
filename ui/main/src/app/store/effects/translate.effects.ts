/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
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
import {ThirdsService} from "@ofServices/thirds.service";
import {ThirdMenu} from "@ofModel/thirds.model";
import {LoadMenuSuccess, MenuActionTypes} from "@ofActions/menu.actions";

@Injectable()
export class TranslateEffects {


    constructor(private store: Store<AppState>
        , private actions$: Actions
        , private translate: TranslateService
        , private thirdService: ThirdsService
    ) {
    }

    private static i18nBundleVersionLoaded = new Map<Set<string>>();

    @Effect()
    updateTranslateService: Observable<TranslateActions> = this.actions$
        .pipe(
            ofType(TranslateActionsTypes.UpdateTranslation)
            ,
            mergeMap((action: UpdateTranslation) => {
                const thirdsWithTheirVersions = action.payload.versions;
                return forkJoin(this.mapLanguages(thirdsWithTheirVersions)).pipe(
                    concatAll(),
                    catchError((error, caught) => {
                        console.error('error while trying to update translation', error);
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
    mapLanguages(thirdsAndVersions: Map<Set<string>>): Observable<boolean>[] {
        const locales = this.translate.getLangs();
        return locales.map(locale => {
            return forkJoin(this.mapThirds(locale, thirdsAndVersions))
                .pipe(concatAll())
        });
    }

    // iterate over thirds
    mapThirds(locale: string, thirdsAndVersion: Map<Set<string>>): Observable<boolean>[] {
        const thirds = Object.keys(thirdsAndVersion);

        return thirds.map(third => {
            return forkJoin(this.mapVersions(locale, third, thirdsAndVersion[third]))
                .pipe(concatAll());
        })
    }

    // iterate over versions
    mapVersions(locale: string, publisher: string, versions: Set<string>): Observable<boolean>[] {
        return Array.from(versions.values()).map(version => {
            return this.thirdService.askForI18nJson(publisher, locale, version)
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
            // extract thirds+version
            , map((cards: LightCard[]) => TranslateEffects.extractPublisherAssociatedWithDistinctVersionsFromCards(cards))
            // extract version needing to be updated
            , switchMap((versions: Map<Set<string>>) => {
                return this.extractI18nToUpdate(versions);
            })
            // send action accordingly
            , map((publisherAndVersion: Map<Set<string>>) => {
                return TranslateEffects.sendTranslateAction(publisherAndVersion)
            })
        );

    private extractI18nToUpdate(versions: Map<Set<string>>) {
            return of(TranslateEffects.extractThirdToUpdate(versions, TranslateEffects.i18nBundleVersionLoaded));
    }

    static extractPublisherAssociatedWithDistinctVersionsFromCards(cards: LightCard[]): Map<Set<string>> {
        let thirdsAndVersions: TransitionalThirdWithItSVersion[];
        thirdsAndVersions = cards.map(card => {
            return new TransitionalThirdWithItSVersion(card.publisher,card.publisherVersion);
        });
        
        return this.consolidateThirdAndVersions(thirdsAndVersions);
    };

    @Effect()
    verifyTranslationNeedForMenus:Observable<TranslateActions> = this.actions$
        .pipe(
            ofType(MenuActionTypes.LoadMenuSuccess)
            , map((loadedMenusAction:LoadMenuSuccess)=>loadedMenusAction.payload.menu)
            , map((menus:ThirdMenu[])=>TranslateEffects.extractPublisherAssociatedWithDistinctVersionsFrom(menus))
            , switchMap((versions: Map<Set<string>>)=>this.extractI18nToUpdate(versions))
            , map((publisherAndVersions:Map<Set<string>>)=>TranslateEffects.sendTranslateAction(publisherAndVersions))


        );


    static extractPublisherAssociatedWithDistinctVersionsFrom(menus: ThirdMenu[]):Map<Set<string>>{
        
        const thirdsAndVersions = menus.map(menu=>{
            return new TransitionalThirdWithItSVersion(menu.id,menu.version);
        })
        return this.consolidateThirdAndVersions(thirdsAndVersions);

    }

    private static consolidateThirdAndVersions(thirdsAndVersions:TransitionalThirdWithItSVersion[]) {
        const result = new Map<Set<string>>();
        thirdsAndVersions.forEach(u => {
            const versions = result[u.third];
            if (versions) {
                versions.add(u.version)
            } else {
                result[u.third] = new Set([u.version]);
            }
        });
        return result;
    }

    static extractThirdToUpdate(versionInput: Map<Set<string>>, cachedVersions: Map<Set<string>>): Map<Set<string>> {
        const inputPublishers = Object.keys(versionInput);
        const cachedPublishers = Object.keys(cachedVersions);
        const unCachedPublishers = _.difference(inputPublishers, cachedPublishers);

        const translationReferencesToUpdate = new Map<Set<string>>();
        unCachedPublishers.forEach(publisher => {
            const versions2Update = versionInput[publisher];
            translationReferencesToUpdate[publisher] = versions2Update;
        });

        let cachedPublishersForVersionVerification = inputPublishers;
        if (unCachedPublishers && (unCachedPublishers.length > 0)) {
            cachedPublishersForVersionVerification = _.difference(unCachedPublishers, inputPublishers);
        }

        cachedPublishersForVersionVerification.forEach(third => {
            const currentInputVersions = versionInput[third];
            const currentCachedVersions = cachedVersions[third];
            const untrackedVersions = _.difference(Array.from(currentInputVersions), Array.from(currentCachedVersions));
            if (untrackedVersions && Object.keys(untrackedVersions).length > 0) {
                translationReferencesToUpdate[third] = new Set(untrackedVersions);
            }
        });
        const nbOfPublishers = Object.keys(translationReferencesToUpdate).length;
        return (nbOfPublishers > 0) ? translationReferencesToUpdate : null;
    }

    static sendTranslateAction(versionToUpdate: Map<Set<string>>): TranslateActions {
        if (versionToUpdate) {
            TranslateEffects.i18nBundleVersionLoaded = {...TranslateEffects.i18nBundleVersionLoaded, ...versionToUpdate};
            return new UpdateTranslation({versions: versionToUpdate});
            }
        return new TranslationUpToDate();
    }
}

class TransitionalThirdWithItSVersion {
    constructor(public third:string, public version:string){}
};

