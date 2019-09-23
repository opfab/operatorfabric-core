import {Injectable} from "@angular/core";
import {Action, Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {Actions, Effect, ofType} from "@ngrx/effects";
import {TranslateService} from "@ngx-translate/core";
import {forkJoin, Observable, pipe} from "rxjs";
import {LightCardActionTypes, LoadLightCardsSuccess} from "@ofActions/light-card.actions";
import {map, switchMap, tap} from "rxjs/operators";
import {HttpClient, HttpParams} from "@angular/common/http";
import {
    TranslateActions, TranslateActionsTypes,
    TranslationUpToDate,
    UpdateTranslation,
    UpdateTranslationSuccessful
} from "@ofActions/translate.actions";
import {LightCard} from "@ofModel/light-card.model";
import {Map} from "@ofModel/map";
import * as _ from 'lodash';
import {selectI18nUpLoaded, selectTranslation} from "@ofSelectors/translation.selectors";
import {ThirdsService} from "@ofServices/thirds.service";

@Injectable()
export class TranslateEffects {

    constructor(private store: Store<AppState>
        , private actions$: Actions
        , private translate: TranslateService
        , private thirdService: ThirdsService
        , private httpClient: HttpClient
    ) {
    }

    @Effect()
    updateTranslateService: Observable<TranslateActions> = this.actions$
        .pipe(
            ofType(TranslateActionsTypes.UpdateTranslation),
            switchMap((action: UpdateTranslation) => {
                const extract = action.payload.versions;
                const publishers = Object.keys(extract);
                return forkJoin(publishers.map(publisher=>{
                    const versions = extract[publisher];
                    return Array.from(versions.values()).map(version=>{
                        return this.thirdService.grepAllI18n(publisher,version);
                    });
                })).pipe();
            }));

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
                const result = this.store.select(selectI18nUpLoaded).pipe(
                    map((referencedTranslation: Map<Set<string>>) =>{
                        return TranslateEffects.extractThirdToUpdate(versions, referencedTranslation)
                    }));
                return result;
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
