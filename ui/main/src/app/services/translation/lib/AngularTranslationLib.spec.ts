/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 *  See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {TestBed} from '@angular/core/testing';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {AngularTranslationLib} from './AngularTranslationLib';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';

describe('AngularTranslationService', () => {
    let service: AngularTranslationLib;
    let translateService: TranslateService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            providers: [TranslateService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        });

        translateService = TestBed.inject(TranslateService);
        service = new AngularTranslationLib(translateService);
    });

    it('should get translation', () => {
        service.setTranslation('en', {key: 'valueInEnglish'}, true);
        service.setLang('en');
        expect(service.getTranslation('key')).toBe('valueInEnglish');
    });

    it('should get translation for chosen language', () => {
        service.setTranslation('en', {key: 'value'}, true);
        service.setTranslation('fr', {key: 'valueInFrench'}, true);
        service.setLang('fr');
        expect(service.getTranslation('key')).toBe('valueInFrench');
    });

    it('should get translation with a parameter', () => {
        service.setTranslation('en', {key: 'valueInEnglish {{param}}'}, true);
        service.setLang('en');
        expect(service.getTranslation('key', {param: 'paramValue'})).toBe('valueInEnglish paramValue');
    });

    it('should get translation with two parameters', () => {
        service.setTranslation('en', {key: 'valueInEnglish {{param1}} {{param2}}'}, true);
        service.setLang('en');
        expect(service.getTranslation('key', {param1: 'param1Value', param2: 'param2Value'})).toBe(
            'valueInEnglish param1Value param2Value'
        );
    });

    it('should get key name if key is not defined', () => {
        expect(service.getTranslation('undefinedKey')).toBe('undefinedKey');
    });
});
