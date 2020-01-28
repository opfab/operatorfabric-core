
import {AppState} from "@ofStore/index";
import {settingsInitialState, SettingsState} from "@ofStates/settings.state";
import {configInitialState, ConfigState} from "@ofStates/config.state";
import {buildSettingsOrConfigSelector, selectMergedSettings} from "@ofSelectors/settings.x.config.selectors";
import {emptyAppState4Test} from "@tests/helpers";

describe('SettingsXConfigSelectors', () => {
    let emptyAppState: AppState = emptyAppState4Test;

    let loadedSettingsState: SettingsState = {
        ...settingsInitialState,
        loaded: true,
        settings: {
            test: {
                path: {my: {settings: 'value'}}
            }
        }
    };
    let loadedConfigState: ConfigState = {
        ...configInitialState,
        loaded: true,
        config: {
            settings: {
                test: {
                    path: {my: {settings: 'default value'}},
                    byDefault:{
                        value: 'default value'
                    }
                }
            }
        }
    };



    it('manage empty', () => {
        let testAppState = {...emptyAppState, settings: settingsInitialState, config: configInitialState};
        expect(selectMergedSettings(testAppState)).toEqual({});
        expect(buildSettingsOrConfigSelector('test.path.my.settings')(testAppState)).toEqual(null);
        expect(buildSettingsOrConfigSelector('test.byDefault.value')(testAppState)).toEqual(null);
        expect(buildSettingsOrConfigSelector('test.byDefault.value','fallback')(testAppState)).toEqual('fallback');
    });

    it('manage loaded settings and config', () => {
        let testAppState = {...emptyAppState, settings: loadedSettingsState, config: loadedConfigState};
        expect(selectMergedSettings(testAppState)).toEqual({
            test: {
                path: {my: {settings: 'value'}},
                byDefault:{
                    value: 'default value'
                }
            }
        });
        expect(buildSettingsOrConfigSelector('test.path.my.settings')(testAppState)).toEqual('value');
        expect(buildSettingsOrConfigSelector('test.byDefault.value')(testAppState)).toEqual('default value');
        expect(buildSettingsOrConfigSelector('test.byDefault.value','fallback')(testAppState)).toEqual('default value');
    });


})
;
