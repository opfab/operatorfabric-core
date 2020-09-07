/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {
    generateRandomArray,
    generateBusinessconfigWithVersion,
    getOneRandomCard,
    getRandomAlphanumericValue,
    shuffleArrayContentByFisherYatesLike
} from "@tests/helpers";
import {TranslateEffects} from "@ofEffects/translate.effects";
import {LightCard} from "@ofModel/light-card.model";
import {Map} from "@ofModel/map";
import * as _ from "lodash"
import {TranslationUpToDate, UpdateTranslation} from "@ofActions/translate.actions";
import {AppState} from "@ofStore/index";
import {Store} from "@ngrx/store";
import {Actions} from "@ngrx/effects";
import {LoadLightCardsSuccess} from "@ofActions/light-card.actions";
import {hot} from "jasmine-marbles";
import {TranslateService} from "@ngx-translate/core";
import {ProcessesService} from "@ofServices/processes.service";
import SpyObj = jasmine.SpyObj;

// useful to generate some random version or publisher names
function getRandomStringOf8max() {
    return getRandomAlphanumericValue(3, 8);
}

describe('Translate effect when receiving processes and their versions to upload', () => {

    it('should send TranslationUptoDate if no version provided to update', () => {
        const underTest = TranslateEffects.sendTranslateAction(null);
        expect(underTest).toBeTruthy();
        expect(underTest).toEqual(new TranslationUpToDate());
    });

    it('should send an appropriate UpdateTranslation Action if a version to update is provided', () => {
        const businessconfigWithVersions = generateBusinessconfigWithVersion(getRandomAlphanumericValue(5, 9));
        const underTest = TranslateEffects.sendTranslateAction(businessconfigWithVersions);
        expect(underTest).toBeTruthy();
        expect(underTest).toEqual(new UpdateTranslation({versions: businessconfigWithVersions}));
    })

});

describe('Translation effect when comparing process with versions ', () => {
    it("shouldn't extract anything as long as input versions are already cached", () => {
        const businessconfigNotToUpdate = getRandomAlphanumericValue(5);
        const versionNotToUpdate = generateRandomArray(4, 9, getRandomStringOf8max);
        const referencedBusinessconfigWithVersions = generateBusinessconfigWithVersion(businessconfigNotToUpdate, new Set(versionNotToUpdate));

        const subSetVersions = _.drop(shuffleArrayContentByFisherYatesLike(versionNotToUpdate), 3);

        const inputVersions = generateBusinessconfigWithVersion(businessconfigNotToUpdate, new Set<string>(subSetVersions));

        const underTest = TranslateEffects.extractBusinessconfigToUpdate(inputVersions, referencedBusinessconfigWithVersions);

        expect(underTest).not.toBeTruthy();
    });

    it('should extract untracked versions of referenced process but not existing ones,' +
        ' case with a mix of new and cached ones', () => {

        const referencedBusinessconfigWithVersions = generateBusinessconfigWithVersion();

        const businessconfigToUpdate = getRandomAlphanumericValue(6);
        const versionToUpdate = generateRandomArray(3, 5, getRandomStringOf8max);
        referencedBusinessconfigWithVersions[businessconfigToUpdate] = new Set(versionToUpdate);

        const newVersions = generateRandomArray(2, 4, getRandomStringOf8max);
        const inputBusinessconfig = generateBusinessconfigWithVersion(businessconfigToUpdate,
            new Set(
                shuffleArrayContentByFisherYatesLike(_.concat(newVersions, versionToUpdate))
            ));

        const underTest = TranslateEffects.extractBusinessconfigToUpdate(inputBusinessconfig, referencedBusinessconfigWithVersions);
        expect(underTest).toBeTruthy();
        const underTestVersion = Object.values(underTest);
        expect(underTestVersion.length).toEqual(1);
        expect(underTestVersion[0].size).toEqual(newVersions.length);
        //verifies that extracted version are not from the referenced ones
        underTestVersion[0].forEach(version => {
            expect(_.includes(versionToUpdate, version)).toEqual(false);
        });
    });
    it('should extract untracked versions of referenced process but not existing ones,' +
        ' case with only new ones', () => {
        const referencedBusinessconfigWithVersions = new Map<Set<string>>();

        const businessconfigNotToUpdate = getRandomAlphanumericValue(5);
        const versionNotToUpdate = generateRandomArray(2, 5, getRandomStringOf8max);
        referencedBusinessconfigWithVersions[businessconfigNotToUpdate] = new Set(versionNotToUpdate);

        const businessconfigToUpdate = getRandomAlphanumericValue(6);
        const versionToUpdate = generateRandomArray(3, 5, getRandomStringOf8max);
        referencedBusinessconfigWithVersions[businessconfigToUpdate] = new Set(versionToUpdate);

        const inputBusinessconfig = new Map<Set<string>>();
        const newVersions = new Set(generateRandomArray(2, 4, getRandomStringOf8max));
        inputBusinessconfig[businessconfigToUpdate] = newVersions;

        const underTest = TranslateEffects.extractBusinessconfigToUpdate(inputBusinessconfig, referencedBusinessconfigWithVersions);

        expect(underTest).toBeTruthy();
        const underTestBusinessconfig = Object.keys(underTest);
        expect(underTestBusinessconfig.length).toEqual(1);
        expect(underTestBusinessconfig[0]).toEqual(businessconfigToUpdate);
        const underTestVersions = Object.values(underTest);
        expect(underTestVersions.length).toEqual(1);
        expect(underTestVersions[0]).toEqual(newVersions);
    });

    it('should extract the process not referenced', () => {

        const reference = new Map<Set<string>>();
        const referencedVersions = ['version0', 'version1'];
        const referencedBusinessconfig = 'businessconfig';
        reference[referencedBusinessconfig] = new Set(referencedVersions);


        const newProcess = getRandomAlphanumericValue(8);
        const randomVersions = generateRandomArray(2, 5, getRandomStringOf8max);

        expect(randomVersions).toBeTruthy();
        const businessconfigInput = new Map<Set<string>>();
        businessconfigInput[newProcess] = new Set(randomVersions);
        businessconfigInput[referencedBusinessconfig] = new Set(referencedVersions);

        const expectOutPut = new Map<Set<string>>();
        expectOutPut[newProcess] = new Set(randomVersions);

        const underTest = TranslateEffects.extractBusinessconfigToUpdate(businessconfigInput, reference);
        expect(underTest).toEqual(expectOutPut);
    });

});

describe('Translation effect reacting to successfully loaded Light Cards', () => {	

    let underTest: TranslateEffects;	
    let storeMock: SpyObj<Store<AppState>>;	
    let localAction$: Actions;	
    let translateServMock: SpyObj<TranslateService>;	
    let businessconfigServMock: SpyObj<ProcessesService>;

    beforeEach(() => {	
        storeMock = jasmine.createSpyObj('Store', ['select', 'dispatch']);	

    });

})
