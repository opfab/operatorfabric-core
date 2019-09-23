import {Action} from "@ngrx/store";
import {Map} from "@ofModel/map";

export enum TranslateActionsTypes {
    UpdateTranslation = '[i18n] Translation need an update',
    UpdateTranslationSuccessful = '[i18n] Translation successfully updated',
    UpdateTranslationFailed = '[i18n] Translation update failed',
    TranslationUpToDate = '[i18n] all Translation materials are already loaded'
}

export class UpdateTranslation implements Action {
    readonly type = TranslateActionsTypes.UpdateTranslation;

    constructor(public payload: { versions: Map<Set<string>> }) {
    }
}

export class TranslationUpToDate implements Action {
    readonly type = TranslateActionsTypes.TranslationUpToDate;
}

export class UpdateTranslationSuccessful implements Action {
    readonly type = TranslateActionsTypes.UpdateTranslationSuccessful;

    constructor(public payload: { lang: string }) {
    }
}

export class UpdateTranslationFailed implements Action {
    readonly type = TranslateActionsTypes.UpdateTranslationFailed;

    constructor(public payload: { error: Error }) {
    }
}

export type TranslateActions = UpdateTranslation |
    UpdateTranslationSuccessful | UpdateTranslationFailed | TranslationUpToDate;
