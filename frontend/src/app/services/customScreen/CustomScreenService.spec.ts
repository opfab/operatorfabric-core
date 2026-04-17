/* Copyright (c) 2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CustomScreenService} from './CustomScreenService';
import {ScreenDefinition, ScreenType} from './ScreenDefinition';
import {LoggerService} from 'app/services/logs/LoggerService';

describe('CustomScreenService', () => {
    beforeEach(() => {
        CustomScreenService.clearCustomScreenDefinitions();
    });

    it('should add a custom screen definition with a valid type', () => {
        const screenDef: ScreenDefinition = {
            id: 'screen1',
            name: 'Screen One',
            type: ScreenType.CARD_LIST
        };
        CustomScreenService.addCustomScreenDefinition(screenDef);
        expect(CustomScreenService.getCustomScreenDefinition('screen1')).toEqual(screenDef);
    });

    it('should not add a custom screen definition when type is missing and log an error', () => {
        const errorSpy = spyOn(LoggerService, 'error');
        const screenDef = {
            id: 'screen2',
            name: 'Screen Two'
        } as ScreenDefinition;

        CustomScreenService.addCustomScreenDefinition(screenDef);

        expect(CustomScreenService.getCustomScreenDefinition('screen2')).toBeUndefined();
        expect(errorSpy).toHaveBeenCalledWith(
            jasmine.stringContaining("Custom screen with id 'screen2' has no 'type' defined and will not be loaded")
        );
    });

    it('should not add a custom screen definition when type is invalid and log an error', () => {
        const errorSpy = spyOn(LoggerService, 'error');
        const screenDef = {
            id: 'screen3',
            name: 'Screen Three',
            type: 'INVALID_TYPE'
        } as any;

        CustomScreenService.addCustomScreenDefinition(screenDef);

        expect(CustomScreenService.getCustomScreenDefinition('screen3')).toBeUndefined();
        expect(errorSpy).toHaveBeenCalledWith(
            jasmine.stringContaining(
                "Custom screen with id 'screen3' has an invalid type 'INVALID_TYPE' and will not be loaded"
            )
        );
    });

    it('should add multiple custom screen definitions with valid types', () => {
        const screenDef1: ScreenDefinition = {id: 'screen1', name: 'Screen One', type: ScreenType.CARD_LIST};
        const screenDef2: ScreenDefinition = {id: 'screen2', name: 'Screen Two', type: ScreenType.DASHBOARD};

        CustomScreenService.addCustomScreenDefinition(screenDef1);
        CustomScreenService.addCustomScreenDefinition(screenDef2);

        expect(CustomScreenService.getCustomScreenDefinition('screen1')).toEqual(screenDef1);
        expect(CustomScreenService.getCustomScreenDefinition('screen2')).toEqual(screenDef2);
    });

    it('should not add a custom screen definition when id is already declared and log an error', () => {
        const errorSpy = spyOn(LoggerService, 'error');
        const screenDef1: ScreenDefinition = {id: 'screen1', name: 'Screen One', type: ScreenType.CARD_LIST};
        const screenDef2: ScreenDefinition = {id: 'screen1', name: 'Screen One Duplicate', type: ScreenType.DASHBOARD};

        CustomScreenService.addCustomScreenDefinition(screenDef1);
        CustomScreenService.addCustomScreenDefinition(screenDef2);

        expect(CustomScreenService.getCustomScreenDefinition('screen1')).toEqual(screenDef1);
        expect(errorSpy).toHaveBeenCalledWith(
            jasmine.stringContaining(
                "A custom screen with id 'screen1' is already declared and will not be loaded again"
            )
        );
    });
});
