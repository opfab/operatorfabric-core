import {Injectable} from "@angular/core";
import {Action, Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {Actions, Effect, ofType} from "@ngrx/effects";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";
import {LightCardActionTypes, LoadLightCardsSuccess} from "@ofActions/light-card.actions";
import {map, switchMap, tap} from "rxjs/operators";
import {HttpClient, HttpParams} from "@angular/common/http";
import {
    TranslateActions,
    TranslationUpToDate,
    UpdateTranslation,
    UpdateTranslationSuccessful
} from "@ofActions/translate.actions";
import {LightCard} from "@ofModel/light-card.model";
import {Map} from "@ofModel/map";
import * as _ from 'lodash';
import {selectI18nUpLoaded, selectTranslation} from "@ofSelectors/translation.selectors";

@Injectable()
export class TranslateEffects {

    constructor(private store: Store<AppState>
        , private actions$: Actions
        , private translate: TranslateService
        , private httpClient: HttpClient
    ) {
    }

    @Effect()
    updateTranslateService: Observable<TranslateActions> = this.actions$
        .pipe(
            ofType(LightCardActionTypes.LoadLightCardsSuccess),
            switchMap((action: LoadLightCardsSuccess) => {
                const locale = 'fr';
                const publisher = 'TWOSTATES';
                const version = '1';

                const cards = action.payload.lightCards;
                const params = new HttpParams().set('locale', locale).set('version', version);
                return this.httpClient.get(`http://localhost:2002/thirds/${publisher}/i18n`, {params})
                    .pipe(map(val => {
                            console.log('****************************************>>>>>>>»»»»', val);
                            const object = {};
                            object[publisher] = {};
                            object[publisher][version] = val;
                            return object
                        })
                        , map(trad => {
                            this.translate.setTranslation(locale, trad, true);
                            this.translate.use('fr');
                            return new UpdateTranslationSuccessful({lang: 'fr'});
                        })
                    );
            })
        );

    /*
        extract publisher and version from cards
        reduce to unicity
        check vs state
        if some or all publisher+version not uploaded => uploadaction
        otherwise send action to indicaten every thing is already loaded (need to indicates it ?)
     */
    @Effect()
    verifyTranslationNeeded: Observable<TranslateActions> = this.actions$
        .pipe(
            ofType(LightCardActionTypes.LoadLightCardsSuccess)
            // extract cards
            , map((loadedCardAction: LoadLightCardsSuccess) => loadedCardAction.payload.lightCards)
            // extract thirds+version
            , map((cards: LightCard[]) => TranslateEffects.extractPublisherAssociatedWithDistinctVersions(cards))
            // extract version needing to be updated
            , switchMap((versions: Map<Set<string>>) => {
                return this.store.select(selectI18nUpLoaded).pipe(
                    map((referencedTranslation: Map<Set<string>>) =>{
                        return TranslateEffects.extractThirdToUpdate(versions, referencedTranslation)
                    }));
            })
            // send action accordingly
            , map((publisherAndVersion: Map<Set<string>>) => {
                return TranslateEffects.sendTranslateAction(publisherAndVersion)
            })
        );

    static extractPublisherAssociatedWithDistinctVersions(cards: LightCard[]): Map<Set<string>> {
        const thirdNameIdx = 0;
        const versionIdx = 1;
        const thirdsAndVersions = cards.map(card => {
            const result: [string, string] = [card.publisher, card.publisherVersion];
            return result;
        });
        const result = new Map<Set<string>>();
        thirdsAndVersions.forEach(u => {
            const thirdName = u[thirdNameIdx];
            const versions = result[thirdName];
            const currentVersion = u[versionIdx];
            if (versions) {
                versions.add(currentVersion)
            } else {
                result[thirdName] = new Set([currentVersion]);
            }
        });
        return result;
    };

    static extractThirdToUpdate(versionInput: Map<Set<string>>, cachedVersions: Map<Set<string>>): Map<Set<string>> {
        const translationReferencesToUpdate = new Map<Set<string>>();
        const inputPublishers = Object.keys(versionInput);
        const cachedPublishers = Object.keys(cachedVersions);
        const unCachedPublishers = _.difference(inputPublishers, cachedPublishers);

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
            } else {
            }
        });
        const nbOfPublishers = Object.keys(translationReferencesToUpdate).length;
        return (nbOfPublishers > 0) ? translationReferencesToUpdate : null;
    }

    static sendTranslateAction(versionToUpdate: Map<Set<string>>): TranslateActions {
        if (versionToUpdate) return new UpdateTranslation({versions: versionToUpdate});
        return new TranslationUpToDate();
    }
}
