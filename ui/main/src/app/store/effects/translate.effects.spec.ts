import {
    generateRandomPositiveIntegerWithinRangeWithOneAsMinimum,
    getOneRandomCard,
    getRandomAlphanumericValue
} from "@tests/helpers";
import {TranslateEffects} from "@ofEffects/translate.effects";
import {LightCard} from "@ofModel/light-card.model";
import {Map} from "@ofModel/map";
import * as _ from "lodash"
import {TranslationUpToDate, UpdateTranslation} from "@ofActions/translate.actions";

fdescribe('Static method of translation effects ', ()=>{
    it('should give diff between currents publisher and stored ones',()=>{
            const cardTemplate={publisher:getRandomAlphanumericValue(9)};
            const testACard = getOneRandomCard(cardTemplate);
            const publisher=testACard.publisher;
            const version = new Set([testACard.publisherVersion]);
            const result = TranslateEffects.extractPublisherAssociatedWithDistinctVersions([testACard]);
            expect(result).toBeTruthy();
            expect(result[publisher]).toEqual(version);

    });

    it('should collect different publishers along with their different versions from LightCards', () =>{
        const third0 = getRandomAlphanumericValue(5);
        const templateCard0withRandomVersion={publisher:third0};
        const third1=getRandomAlphanumericValue(7);
        const templateCard1withRandomVersion={publisher:third1};
        const version0=getRandomAlphanumericValue(3);
        const templateCard0FixedVersion={...templateCard0withRandomVersion,publisherVersion:version0};
        const version1=getRandomAlphanumericValue(5);
        const templateCard1FixedVersion={...templateCard1withRandomVersion,publisherVersion:version1};
        const cards:LightCard[]=[];

        const numberOfFreeVersion= 5;
        for(let i=0; i<numberOfFreeVersion;++i){
            cards.push(getOneRandomCard(templateCard0withRandomVersion));
            cards.push(getOneRandomCard(templateCard1withRandomVersion));
        }

        for(let i=0; i<3;++i){
            cards.push(getOneRandomCard(templateCard0FixedVersion));
            cards.push(getOneRandomCard(templateCard1FixedVersion));
        }

        const underTest = TranslateEffects.extractPublisherAssociatedWithDistinctVersions(cards);

        const OneCommonVersion = 1;
        const firstThird = underTest[third0];
        const secondThirdVersion = underTest[third1];
        expect(Object.entries(underTest).length).toEqual(2);

        expect(firstThird).toBeTruthy();
        expect(firstThird.size).toEqual(numberOfFreeVersion+OneCommonVersion);
        expect(firstThird.has(version0)).toBe(true);

        expect(secondThirdVersion).toBeTruthy();
        expect(secondThirdVersion.size).toEqual(numberOfFreeVersion+OneCommonVersion);
        expect(secondThirdVersion.has(version1)).toBe(true);
    })

    it('should extract the publisher not referenced', () =>{

        const reference = new Map<Set<string>>();
        const referencedVersions = ['version0','version1'];
        const referencedThird = 'third';
        reference[referencedThird]= new Set(referencedVersions);


        const newPublisher = getRandomAlphanumericValue(8);
        const randomVersions = generateStringArray(2,5,4);

        expect(randomVersions).toBeTruthy();
        const thirdInput=new Map<Set<string>>();
        thirdInput[newPublisher]=new Set(randomVersions);
        thirdInput[referencedThird]=new Set(referencedVersions);

        const expectOutPut=new Map<Set<string>>();
        expectOutPut[newPublisher]=new Set(randomVersions);

        const underTest = TranslateEffects.extractThirdToUpdate(thirdInput,reference);
        expect(underTest).toEqual(expectOutPut);
    })

    it('should extract untracked versions of referenced publisher but not existing ones,' +
        ' case with only new ones',()=>{
        const referencedThirdsWithVersions = new Map<Set<string>>();

        const thirdNotToUpdate = getRandomAlphanumericValue(5);
        const versionNotToUpdate = generateStringArray(2,5,4);
        referencedThirdsWithVersions[thirdNotToUpdate]=new Set(versionNotToUpdate);

        const thirdToUpdate = getRandomAlphanumericValue(6);
        const versionToUpdate = generateStringArray(3,5,8);
        referencedThirdsWithVersions[thirdToUpdate]=new Set(versionToUpdate);

        const inputThirds = new Map<Set<string>>();
        const newVersions = new Set(generateStringArray(2,4,3));
        inputThirds[thirdToUpdate]=newVersions;

        const underTest = TranslateEffects.extractThirdToUpdate(inputThirds,referencedThirdsWithVersions);

        expect(underTest).toBeTruthy();
        const underTestThird = Object.keys(underTest);
        expect(underTestThird.length).toEqual(1);
        expect(underTestThird[0]).toEqual(thirdToUpdate);
        const underTestVersions=Object.values(underTest);
        expect(underTestVersions.length).toEqual(1);
        expect(underTestVersions[0]).toEqual(newVersions);
    });

    it(' for shuffle elements of an array have at least two elements switch in it',()=>{
       const inputArray = generateStringArray(5,8,12);
        const shuffledArray=shuffleArrayContentByFisherYatesLike(inputArray);
        expect(shuffledArray.length).toEqual(inputArray.length);
// verify that at least two elements have been permuted
        const test = Array.from(Array(inputArray.length).keys())
        let nbOfDifferentElementAtSameIndex=0;
        test.forEach(elem =>{
            if(shuffledArray[elem] !=inputArray[elem])++nbOfDifferentElementAtSameIndex;
        });
        expect(nbOfDifferentElementAtSameIndex).toBeGreaterThanOrEqual(2);
    });

    it('should extract untracked versions of referenced publisher but not existing ones,' +
        ' case with a mix of new and cached ones', ()=>{

        const referencedThirdsWithVersions = generateThirdWithVersion();

        const thirdToUpdate = getRandomAlphanumericValue(6);
        const versionToUpdate = generateStringArray(3,5,8);
        referencedThirdsWithVersions[thirdToUpdate]=new Set(versionToUpdate);

        const newVersions = generateStringArray(2,4,3);
        const inputThirds = generateThirdWithVersion(thirdToUpdate,
            new Set(
                shuffleArrayContentByFisherYatesLike(_.concat(newVersions,versionToUpdate))
            ));

        const underTest=TranslateEffects.extractThirdToUpdate(inputThirds,referencedThirdsWithVersions);
        expect(underTest).toBeTruthy();
        const underTestVersion = Object.values(underTest);
        expect(underTestVersion.length).toEqual(1);
        expect(underTestVersion[0].size).toEqual(newVersions.length);
        //verifies that extracted version are not from the referenced ones
        underTestVersion[0].forEach(version =>{
            expect(_.includes(versionToUpdate,version)).toEqual(false);
        });


    });


    it("shouldn't extract anything as long as input versions are already cached" ,()=>{
        const thirdNotToUpdate = getRandomAlphanumericValue(5);
        const versionNotToUpdate = generateStringArray(4,9,4);
        const referencedThirdsWithVersions = generateThirdWithVersion(thirdNotToUpdate,new Set(versionNotToUpdate));

        const subSetVersions = _.drop(shuffleArrayContentByFisherYatesLike(versionNotToUpdate),3);

        const inputVersions = generateThirdWithVersion(thirdNotToUpdate,new Set<string>(subSetVersions));

        const underTest = TranslateEffects.extractThirdToUpdate(inputVersions,referencedThirdsWithVersions);

        expect(underTest).not.toBeTruthy();
    });


it('should send TranslationUptoDate if no version provided to update',()=>{
    const underTest = TranslateEffects.sendTranslateAction(null);
    expect(underTest).toBeTruthy();
    expect(underTest).toEqual(new TranslationUpToDate());
});

it('should send an appropriate UpdateTranslation Action if a version to update is provided',()=>{
    const thirdWithVersions=generateThirdWithVersion(getRandomAlphanumericValue(5,9));
    const underTest = TranslateEffects.sendTranslateAction(thirdWithVersions);
    expect(underTest).toBeTruthy();
    expect(underTest).toEqual(new UpdateTranslation({versions:thirdWithVersions}));
})

});
function generateStringArray(minItemNumebr: number, maxItemNbr:number,maxStringLength:number):string[]{
    return Array.from(Array(generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(minItemNumebr,maxItemNbr))).map(nothing=>{
        return getRandomAlphanumericValue(maxStringLength);
    });
}
function shuffleArrayContentByFisherYatesLike<T>(array:Array<T>):Array<T>{
    let workingArray=Object.assign([],array);
    let currentLengthOfRemainingArrayToShuffle = array.length;
    let valueHolderForPermutation:T;
    let currentIndex:number;
    // need a new array other wise the old one behave weirdly
    const result=Array<T>(currentLengthOfRemainingArrayToShuffle);
    while (currentLengthOfRemainingArrayToShuffle){
        currentIndex=Math.floor(Math.random()*currentLengthOfRemainingArrayToShuffle--);
        valueHolderForPermutation=workingArray[currentLengthOfRemainingArrayToShuffle];
        result[currentLengthOfRemainingArrayToShuffle]=workingArray[currentIndex];
        workingArray[currentIndex]=valueHolderForPermutation;
    }
    return result;
}

function generateThirdWithVersion(thirdName?:string,versions?:Set<string>):Map<Set<string>>{
    const result = new Map<Set<string>>();
     result[(thirdName)?thirdName:getRandomAlphanumericValue(3,5)]=(versions)?versions:new Set(generateStringArray(3,6,9));
    return result;
}

describe('Translation effect reacting to successfully loaded Light Cards', ()=>{



})
