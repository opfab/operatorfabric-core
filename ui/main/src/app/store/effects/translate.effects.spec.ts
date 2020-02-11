/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    generateRandomArray,
    generateThirdWithVersion,
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
import {ThirdsService} from "@ofServices/thirds.service";
import SpyObj = jasmine.SpyObj;

// useful to generate some random version or publisher names
function getRandomStringOf8max() {
    return getRandomAlphanumericValue(3, 8);
}

describe('Translation effect when extracting publisher and their version from LightCards  ', () => {

    it('should return the publisher of an input lightCard.', () => {	
        const cardTemplate = {publisher: getRandomAlphanumericValue(9)};	
        const testACard = getOneRandomCard(cardTemplate);	
        const publisher = testACard.publisher;	
        const version = new Set([testACard.publisherVersion]);	
        const result = TranslateEffects.extractPublisherAssociatedWithDistinctVersionsFromCards([testACard]);	
        expect(result).toBeTruthy();	
        expect(result[publisher]).toEqual(version);	
    });
    xit('should collect different publishers along with their different versions from LightCards', () => {
        const third0 = getRandomAlphanumericValue(5);	
        const templateCard0withRandomVersion = {publisher: third0};	
        const third1 = getRandomAlphanumericValue(7);	
        const templateCard1withRandomVersion = {publisher: third1};	
        const version0 = getRandomAlphanumericValue(3);	
        const templateCard0FixedVersion = {...templateCard0withRandomVersion, publisherVersion: version0};	
        const version1 = getRandomAlphanumericValue(5);	
        const templateCard1FixedVersion = {...templateCard1withRandomVersion, publisherVersion: version1};	
        const cards: LightCard[] = [];	
        const numberOfFreeVersion = 5;	
        for (let i = 0; i < numberOfFreeVersion; ++i) {	
            cards.push(getOneRandomCard(templateCard0withRandomVersion));	
            cards.push(getOneRandomCard(templateCard1withRandomVersion));	
        }	
        for (let i = 0; i < 3; ++i) {	
            cards.push(getOneRandomCard(templateCard0FixedVersion));	
            cards.push(getOneRandomCard(templateCard1FixedVersion));	
        }	
        const underTest = TranslateEffects.extractPublisherAssociatedWithDistinctVersionsFromCards(cards);	
        const OneCommonVersion = 1;	
        const firstThird = underTest[third0];	
        const secondThirdVersion = underTest[third1];	
        expect(Object.entries(underTest).length).toEqual(2);	
        expect(firstThird).toBeTruthy();	
        expect(firstThird.size).toEqual(numberOfFreeVersion + OneCommonVersion);	
        expect(firstThird.has(version0)).toBe(true);	
        expect(secondThirdVersion).toBeTruthy();	
        expect(secondThirdVersion.size).toEqual(numberOfFreeVersion + OneCommonVersion);	
        expect(secondThirdVersion.has(version1)).toBe(true);	
    });


});
describe('Translate effect when receiving publishers and their versions to upload', () => {

    it('should send TranslationUptoDate if no version provided to update', () => {
        const underTest = TranslateEffects.sendTranslateAction(null);
        expect(underTest).toBeTruthy();
        expect(underTest).toEqual(new TranslationUpToDate());
    });

    it('should send an appropriate UpdateTranslation Action if a version to update is provided', () => {
        const thirdWithVersions = generateThirdWithVersion(getRandomAlphanumericValue(5, 9));
        const underTest = TranslateEffects.sendTranslateAction(thirdWithVersions);
        expect(underTest).toBeTruthy();
        expect(underTest).toEqual(new UpdateTranslation({versions: thirdWithVersions}));
    })

});

describe('Translation effect when comparing publishers with versions ', () => {
    it("shouldn't extract anything as long as input versions are already cached", () => {
        const thirdNotToUpdate = getRandomAlphanumericValue(5);
        const versionNotToUpdate = generateRandomArray(4, 9, getRandomStringOf8max);
        const referencedThirdsWithVersions = generateThirdWithVersion(thirdNotToUpdate, new Set(versionNotToUpdate));

        const subSetVersions = _.drop(shuffleArrayContentByFisherYatesLike(versionNotToUpdate), 3);

        const inputVersions = generateThirdWithVersion(thirdNotToUpdate, new Set<string>(subSetVersions));

        const underTest = TranslateEffects.extractThirdToUpdate(inputVersions, referencedThirdsWithVersions);

        expect(underTest).not.toBeTruthy();
    });

    it('should extract untracked versions of referenced publisher but not existing ones,' +
        ' case with a mix of new and cached ones', () => {

        const referencedThirdsWithVersions = generateThirdWithVersion();

        const thirdToUpdate = getRandomAlphanumericValue(6);
        const versionToUpdate = generateRandomArray(3, 5, getRandomStringOf8max);
        referencedThirdsWithVersions[thirdToUpdate] = new Set(versionToUpdate);

        const newVersions = generateRandomArray(2, 4, getRandomStringOf8max);
        const inputThirds = generateThirdWithVersion(thirdToUpdate,
            new Set(
                shuffleArrayContentByFisherYatesLike(_.concat(newVersions, versionToUpdate))
            ));

        const underTest = TranslateEffects.extractThirdToUpdate(inputThirds, referencedThirdsWithVersions);
        expect(underTest).toBeTruthy();
        const underTestVersion = Object.values(underTest);
        expect(underTestVersion.length).toEqual(1);
        expect(underTestVersion[0].size).toEqual(newVersions.length);
        //verifies that extracted version are not from the referenced ones
        underTestVersion[0].forEach(version => {
            expect(_.includes(versionToUpdate, version)).toEqual(false);
        });
    });
    it('should extract untracked versions of referenced publisher but not existing ones,' +
        ' case with only new ones', () => {
        const referencedThirdsWithVersions = new Map<Set<string>>();

        const thirdNotToUpdate = getRandomAlphanumericValue(5);
        const versionNotToUpdate = generateRandomArray(2, 5, getRandomStringOf8max);
        referencedThirdsWithVersions[thirdNotToUpdate] = new Set(versionNotToUpdate);

        const thirdToUpdate = getRandomAlphanumericValue(6);
        const versionToUpdate = generateRandomArray(3, 5, getRandomStringOf8max);
        referencedThirdsWithVersions[thirdToUpdate] = new Set(versionToUpdate);

        const inputThirds = new Map<Set<string>>();
        const newVersions = new Set(generateRandomArray(2, 4, getRandomStringOf8max));
        inputThirds[thirdToUpdate] = newVersions;

        const underTest = TranslateEffects.extractThirdToUpdate(inputThirds, referencedThirdsWithVersions);

        expect(underTest).toBeTruthy();
        const underTestThird = Object.keys(underTest);
        expect(underTestThird.length).toEqual(1);
        expect(underTestThird[0]).toEqual(thirdToUpdate);
        const underTestVersions = Object.values(underTest);
        expect(underTestVersions.length).toEqual(1);
        expect(underTestVersions[0]).toEqual(newVersions);
    });

    it('should extract the publisher not referenced', () => {

        const reference = new Map<Set<string>>();
        const referencedVersions = ['version0', 'version1'];
        const referencedThird = 'third';
        reference[referencedThird] = new Set(referencedVersions);


        const newPublisher = getRandomAlphanumericValue(8);
        const randomVersions = generateRandomArray(2, 5, getRandomStringOf8max);

        expect(randomVersions).toBeTruthy();
        const thirdInput = new Map<Set<string>>();
        thirdInput[newPublisher] = new Set(randomVersions);
        thirdInput[referencedThird] = new Set(referencedVersions);

        const expectOutPut = new Map<Set<string>>();
        expectOutPut[newPublisher] = new Set(randomVersions);

        const underTest = TranslateEffects.extractThirdToUpdate(thirdInput, reference);
        expect(underTest).toEqual(expectOutPut);
    });

});

describe('Translation effect reacting to successfully loaded Light Cards', () => {	

    let underTest: TranslateEffects;	
    let storeMock: SpyObj<Store<AppState>>;	
    let localAction$: Actions;	
    let translateServMock: SpyObj<TranslateService>;	
    let thirdServMock: SpyObj<ThirdsService>;	

    beforeEach(() => {	
        storeMock = jasmine.createSpyObj('Store', ['select', 'dispatch']);	

    });

})
