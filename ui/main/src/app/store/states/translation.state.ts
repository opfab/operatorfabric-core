
import {Map} from "@ofModel/map";

export interface TranslationState {
    i18nBundleVersionLoaded: Map<Set<string>>,
    loading:boolean,
    error:string
}

export const translationInitialState: TranslationState = {
    i18nBundleVersionLoaded:new Map<Set<string>>(),
    loading:false,
    error:null

}
